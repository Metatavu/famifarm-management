export * from './batches.service';
import { BatchesService } from './batches.service';
export * from './events.service';
import { EventsService } from './events.service';
export * from './packageSizes.service';
import { PackageSizesService } from './packageSizes.service';
export * from './performedCultivationActions.service';
import { PerformedCultivationActionsService } from './performedCultivationActions.service';
export * from './productionLines.service';
import { ProductionLinesService } from './productionLines.service';
export * from './products.service';
import { ProductsService } from './products.service';
export * from './reports.service';
import { ReportsService } from './reports.service';
export * from './seedBatches.service';
import { SeedBatchesService } from './seedBatches.service';
export * from './seeds.service';
import { SeedsService } from './seeds.service';
export * from './teams.service';
import { TeamsService } from './teams.service';
export * from './wastageReasons.service';
import { WastageReasonsService } from './wastageReasons.service';
import { KeycloakInstance } from 'keycloak-js';

const API_URL = process.env.REACT_APP_FAMIFARM_API_BASE_PATH || "http://localhost";

export default new class Api {
  
  public async getBatchesService(keycloak: KeycloakInstance): Promise<BatchesService> {
    return new BatchesService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  public async getEventsService(keycloak: KeycloakInstance): Promise<EventsService> {
    return new EventsService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  public async getPackageSizesService(keycloak: KeycloakInstance): Promise<PackageSizesService> {
    return new PackageSizesService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  public async getPerformedCultivationActionsService(keycloak: KeycloakInstance): Promise<PerformedCultivationActionsService> {
    return new PerformedCultivationActionsService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  public async getProductionLinesService(keycloak: KeycloakInstance): Promise<ProductionLinesService> {
    return new ProductionLinesService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  public async getProductsService(keycloak: KeycloakInstance): Promise<ProductsService> {
    return new ProductsService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  public async getReportsService(keycloak: KeycloakInstance): Promise<ReportsService> {
    return new ReportsService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  public async getSeedBatchesService(keycloak: KeycloakInstance): Promise<SeedBatchesService> {
    return new SeedBatchesService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  public async getSeedsService(keycloak: KeycloakInstance): Promise<SeedsService> {
    return new SeedsService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  public async getTeamsService(keycloak: KeycloakInstance): Promise<TeamsService> {
    return new TeamsService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  public async getWastageReasonsService(keycloak: KeycloakInstance): Promise<WastageReasonsService> {
    return new WastageReasonsService(API_URL, await this.checkTokenValidity(keycloak));
  }
  
  /**
   * Check validation of given keycloak's token
   * 
   * @param keycloak 
   */
  private checkTokenValidity(keycloak: KeycloakInstance): Promise<string> {
    return new Promise((resolve, reject) => {
      keycloak.updateToken(5).success(() => {
        resolve(keycloak.token);
      }).error(() => {
        reject();
      })
    });
  }

}
