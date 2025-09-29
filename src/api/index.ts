import Keycloak from 'keycloak-js';
import {
  CampaignsApi,
  Configuration,
  CutPackingsApi,
  DraftsApi,
  EventsApi,
  PackageSizesApi,
  PackingsApi,
  PerformedCultivationActionsApi,
  PestsApi,
  PrintersApi,
  ProductionLinesApi,
  ProductsApi,
  ReportsApi,
  SeedBatchesApi,
  SeedsApi,
  WastageReasonsApi,
  StorageDiscardsApi,
  PackagingFilmBatchesApi
} from '../generated/client';

const API_URL = process.env.REACT_APP_FAMIFARM_API_BASE_PATH || "http://localhost:8080";

/**
 * Class for handling communications with API
 */
export class Api {

  /**
   * Handles response from API
   * 
   * @param response response object
   */
  public static handleResponse(response: any, empty200?: boolean) {
    switch (response.status) {
      case 204:
        return {};
      default:
        if (empty200) {
          return {};
        }
        return response.json();
    }
  }

 /**
   * Returns a promise for cut packings service authenticated with a valid token
   * 
   * @param keycloak  keycloak instance
   * @returns a promise for cut packings service authenticated with a valid token
   */
  public async getCutPackingsService(keycloak: Keycloak): Promise<CutPackingsApi> {
    return new CutPackingsApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns a promise for campaigns service authenticated with a valid token
   * 
   * @param keycloak  keycloak instance
   * @returns a promise for campaigns service authenticated with a valid token
   */
  public async getCampaignsService(keycloak: Keycloak): Promise<CampaignsApi> {
    return new CampaignsApi(await this.getApiConfiguration(keycloak));
  }

  /**
   * Returns a promise of printers service authenticated with a valid token
   * 
   * @param keycloak keycloak instance
   * @returns a promise of printers service authenticated with a valid token
   */
  public async getPrintersService(keycloak: Keycloak): Promise<PrintersApi> {
    return new PrintersApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns promise of packings service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of packings service authenticated with valid token 
   */
  public async getPackingsService(keycloak: Keycloak): Promise<PackingsApi> {
    return new PackingsApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns promise of events service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of events service authenticated with valid token 
   */
  public async getEventsService(keycloak: Keycloak): Promise<EventsApi> {
    return new EventsApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns promise of package sizes service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of package sizes service authenticated with valid token 
   */
  public async getPackageSizesService(keycloak: Keycloak): Promise<PackageSizesApi> {
    return new PackageSizesApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns promise of performed cultivation actions service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of performed cultivation actions service authenticated with valid token 
   */
  public async getPerformedCultivationActionsService(keycloak: Keycloak): Promise<PerformedCultivationActionsApi> {
    return new PerformedCultivationActionsApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns promise of production lines service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of production lines service authenticated with valid token 
   */
  public async getProductionLinesService(keycloak: Keycloak): Promise<ProductionLinesApi> {
    return new ProductionLinesApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns promise of products service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of products service authenticated with valid token 
   */
  public async getProductsService(keycloak: Keycloak): Promise<ProductsApi> {
    return new ProductsApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns promise of reports service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of reports service authenticated with valid token 
   */
  public async getReportsService(keycloak: Keycloak): Promise<ReportsApi> {
    return new ReportsApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns promise of seed batches service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of seed batches service authenticated with valid token 
   */
  public async getSeedBatchesService(keycloak: Keycloak): Promise<SeedBatchesApi> {
    return new SeedBatchesApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns promise of seeds service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of seeds service authenticated with valid token 
   */
  public async getSeedsService(keycloak: Keycloak): Promise<SeedsApi> {
    return new SeedsApi(await this.getApiConfiguration(keycloak));
  }
  
  /**
   * Returns promise of wastage reasons service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of wastage reasons service authenticated with valid token 
   */
  public async getWastageReasonsService(keycloak: Keycloak): Promise<WastageReasonsApi> {
    return new WastageReasonsApi(await this.getApiConfiguration(keycloak));
  }

    /**
   * Returns promise of drafts service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of drafts service authenticated with valid token 
   */
  public async getDraftsService(keycloak: Keycloak): Promise<DraftsApi> {
    return new DraftsApi(await this.getApiConfiguration(keycloak));
  }

  /**
   * Returns promise of pests service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of pests service authenticated with valid token 
   */
  public async getPestsService(keycloak: Keycloak): Promise<PestsApi> {
    return new PestsApi(await this.getApiConfiguration(keycloak));
  }

  /**
   * Returns promise of storage discards service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of storage discards service authenticated with valid token 
   */
  public async getStorageDiscardsService(keycloak: Keycloak): Promise<StorageDiscardsApi> {
    return new StorageDiscardsApi(await this.getApiConfiguration(keycloak));
  }

  /**
   * Returns promise of packaging film batches service authenticated with valid token
   * 
   * @param keycloak keycloak instance
   * @returns promise of packaging film batches service authenticated with valid token 
   */
  public async getPackagingFilmBatchesService(keycloak: Keycloak): Promise<PackagingFilmBatchesApi> {
    return new PackagingFilmBatchesApi(await this.getApiConfiguration(keycloak));
  }
  
  private getApiConfiguration = async (keycloak: Keycloak): Promise<Configuration> => {
    return new Configuration({
      basePath: API_URL,
      accessToken: await this.checkTokenValidity(keycloak)
    });
  }

  /**
   * Check validation of given keycloak's token
   * 
   * @param keycloak 
   */
  private async checkTokenValidity(keycloak: Keycloak): Promise<string> {
    await keycloak.updateToken(5);

    if (!keycloak.token) {
      throw new Error("Token is empty");
    }

    return keycloak.token;
  }

}

export default new Api();
