import { Router } from 'express';
import authRouter from './auth';
import onboardingRouter from './onboarding';
import employeesRouter from './employees';
import departmentsRouter from './departments';
import leaveRouter from './leave';
import payrollRouter from './payroll';
import attendanceRouter from './attendance';
import benefitsRouter from './benefits';
import statsRouter from './stats';
import w4Router from './w4';
import i9Router from './i9';
import directDepositRouter from './directDeposit';
import w2Router from './w2';
import payslipsRouter from './payslips';

const router = Router();

router.use('/auth', authRouter);
router.use('/onboarding', onboardingRouter);
router.use('/employees', employeesRouter);
router.use('/departments', departmentsRouter);
router.use('/leave', leaveRouter);
router.use('/payroll', payrollRouter);
router.use('/attendance', attendanceRouter);
router.use('/benefits', benefitsRouter);
router.use('/stats', statsRouter);
router.use('', w4Router);
router.use('', i9Router);
router.use('', directDepositRouter);
router.use('', w2Router);
router.use('', payslipsRouter);

export default router;
