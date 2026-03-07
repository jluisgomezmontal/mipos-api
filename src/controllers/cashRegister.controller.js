import cashRegisterService from '../services/cashRegister.service.js';
import { successResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

class CashRegisterController {
  async openCashRegister(req, res, next) {
    try {
      const { tenantId, user } = req;
      const cashRegister = await cashRegisterService.openCashRegister(
        tenantId,
        user.userId,
        req.body
      );

      successResponse(
        res,
        { cashRegister },
        'Turno abierto exitosamente',
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  async getCurrentOpenRegister(req, res, next) {
    try {
      const { tenantId, user } = req;
      const cashRegister = await cashRegisterService.getCurrentOpenRegister(
        tenantId,
        user.userId,
        user.role
      );

      successResponse(
        res,
        { cashRegister },
        cashRegister ? 'Turno abierto encontrado' : 'No hay turno abierto',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  async addWithdrawal(req, res, next) {
    try {
      const { tenantId, user } = req;
      const cashRegister = await cashRegisterService.addWithdrawal(
        tenantId,
        user.userId,
        req.body
      );

      successResponse(
        res,
        { cashRegister },
        'Retiro registrado exitosamente',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  async getClosingSummary(req, res, next) {
    try {
      const { tenantId } = req;
      const { cashRegisterId } = req.query;

      const summary = await cashRegisterService.calculateClosingSummary(
        tenantId,
        cashRegisterId
      );

      successResponse(
        res,
        { summary },
        'Resumen de cierre calculado exitosamente',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  async closeCashRegister(req, res, next) {
    try {
      const { tenantId, user } = req;
      const cashRegister = await cashRegisterService.closeCashRegister(
        tenantId,
        user.userId,
        user.role,
        req.body
      );

      successResponse(
        res,
        { cashRegister },
        'Turno cerrado exitosamente',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  async getClosingHistory(req, res, next) {
    try {
      const { tenantId, user } = req;
      const { branchId, cashierId, startDate, endDate, page, limit } = req.query;

      const result = await cashRegisterService.getClosingHistory(
        tenantId,
        user.userId,
        user.role,
        { branchId, cashierId, startDate, endDate },
        { page, limit }
      );

      successResponse(
        res,
        result,
        'Historial de cortes obtenido exitosamente',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  async getClosingById(req, res, next) {
    try {
      const { tenantId, user } = req;
      const { id } = req.params;

      const result = await cashRegisterService.getClosingById(
        tenantId,
        user.userId,
        user.role,
        id
      );

      successResponse(
        res,
        result,
        'Detalle de corte obtenido exitosamente',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new CashRegisterController();
