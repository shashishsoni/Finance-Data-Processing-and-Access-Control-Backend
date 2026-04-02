"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_query_dto_1 = require("./dto/dashboard-query.dto");
class RecentQueryDto {
    limit = 10;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], RecentQueryDto.prototype, "limit", void 0);
let DashboardController = class DashboardController {
    dashboard;
    constructor(dashboard) {
        this.dashboard = dashboard;
    }
    summary(q) {
        return this.dashboard.summary(q);
    }
    categoryTotals(q) {
        return this.dashboard.categoryTotals(q);
    }
    trends(q) {
        return this.dashboard.trends(q);
    }
    recentActivity(query) {
        return this.dashboard.recentActivity(query.limit);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('category-totals'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "categoryTotals", null);
__decorate([
    (0, common_1.Get)('trends'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "trends", null);
__decorate([
    (0, common_1.Get)('recent-activity'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RecentQueryDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "recentActivity", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.VIEWER, client_1.Role.ANALYST, client_1.Role.ADMIN),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map