import { Router } from 'express';
import { ReportController, BackupController, NemotronController } from '../controllers/reorder.controller';
import { ReportService } from '../services/report.service';
import { BackupService } from '../services/backup.service';
import { catchAsync } from '../middleware/async-handler';

let reportController: ReportController;
let backupController: BackupController;
let nemotronController: NemotronController;

export function setReportController(controller: ReportController): void {
  reportController = controller;
  router.get('/summary', catchAsync(reportController.summary.bind(reportController)));
}

export function setBackupController(controller: BackupController): void {
  backupController = controller;
  router.get('/export', catchAsync(backupController.export.bind(backupController)));
  router.post('/import/validate', catchAsync(backupController.validateImport.bind(backupController)));
}

export function setNemotronController(controller: NemotronController): void {
  nemotronController = controller;
  router.post('/explain', catchAsync(nemotronController.explain.bind(nemotronController)));
}

const router = Router();

export { router };
export default router;
