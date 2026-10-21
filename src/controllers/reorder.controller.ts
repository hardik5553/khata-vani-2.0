import { Request, Response } from 'express';
import { ReorderService } from '../services/reorder.service';
import { ReportService } from '../services/report.service';
import { BackupService } from '../services/backup.service';
import { nemotronService } from '../ai/nemotron-provider';
import {
  reportsSummaryQuerySchema,
  reorderSuggestionsQuerySchema,
  backupExportQuerySchema,
} from '../schemas';

export class ReorderController {
  constructor(private reorderService: ReorderService) {}

  async suggestions(req: Request, res: Response): Promise<void> {
    const parsed = reorderSuggestionsQuerySchema.safeParse(req);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const { lookbackDays, leadTimeDays, safetyStock } = parsed.data.query;
    const suggestions = await this.reorderService.getSuggestions({ lookbackDays, leadTimeDays, safetyStock });
    res.json({ suggestions });
  }
}

export class ReportController {
  constructor(private reportService: ReportService) {}

  async summary(req: Request, res: Response): Promise<void> {
    const parsed = reportsSummaryQuerySchema.safeParse(req);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const { from, to } = parsed.data.query;
    const summary = await this.reportService.getSummary({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
    res.json(summary);
  }
}

export class BackupController {
  constructor(private backupService: BackupService) {}

  async export(req: Request, res: Response): Promise<void> {
    const parsed = backupExportQuerySchema.safeParse(req);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const { format } = parsed.data.query;

    if (format === 'csv') {
      const result = await this.backupService.export('csv');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=khatavani-backup.csv');
      // result is a string when format is 'csv'
      res.send(typeof result === 'string' ? result : result.csv);
      return;
    }

    const json = await this.backupService.export('json');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=khatavani-backup.json');
    res.send(json);
  }

  async validateImport(req: Request, res: Response): Promise<void> {
    const { jsonData } = req.body;
    if (typeof jsonData !== 'string') {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'jsonData string is required' } });
      return;
    }

    const validation = await this.backupService.validateImport(jsonData);
    res.json(validation);
  }
}

export class NemotronController {
  async explain(req: Request, res: Response): Promise<void> {
    const { context, question } = req.body;

    if (!context || !question) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'context and question are required' } });
      return;
    }

    const result = await nemotronService.generateExplanation({ context, question });
    res.json({
      enabled: nemotronService.isEnabled(),
      ...result,
    });
  }
}
