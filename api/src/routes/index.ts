import { Router } from 'express';
import authRouter from './auth';
import employeesRouter from './employees';
import departmentsRouter from './departments';
import leaveRouter from './leave';
import payrollRouter from './payroll';
import attendanceRouter from './attendance';
import benefitsRouter from './benefits';

const router = Router();

router.use('/auth', authRouter);
router.use('/employees', employeesRouter);
router.use('/departments', departmentsRouter);
router.use('/leave', leaveRouter);
router.use('/payroll', payrollRouter);
router.use('/attendance', attendanceRouter);
router.use('/benefits', benefitsRouter);

export default router;
