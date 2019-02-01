import { 
  Configuration, 
  Team,
  TeamsApi,
  Product,
  ProductsApi, 
  PackageSize,
  PackageSizesApi} from "famifarm-client";
import { KeycloakInstance } from "keycloak-js";

export default class FamiFarmApiClient {

  getConfig(keycloak: KeycloakInstance): Configuration {
    const cnf = new Configuration({
      basePath: process.env.REACT_APP_FAMIFARM_API_BASE_PATH,
      apiKey: `Bearer ${keycloak.token}`
    });
    console.log(cnf);
    return cnf; 

  }

  /**
   * List teams
   * 
   * @param keycloak 
   * @param firstResult 
   * @param maxResults 
   */
  listTeams(keycloak: KeycloakInstance, firstResult: number, maxResults: number): Promise<Team[]> {
    return this.doRequest(keycloak, new TeamsApi(this.getConfig(keycloak)).listTeams(firstResult, maxResults));
  }

  /**
   * Find team
   * 
   * @param keycloak 
   * @param teamId 
   */
  findTeam(keycloak: KeycloakInstance, teamId: string): Promise<Team> {
    return this.doRequest(keycloak, new TeamsApi(this.getConfig(keycloak)).findTeam(teamId));
  }

  /**
   * Create team
   * 
   * @param keycloak 
   * @param team 
   */
  createTeam(keycloak: KeycloakInstance, team: Team):  Promise<Team> {
    return this.doRequest(keycloak, new TeamsApi(this.getConfig(keycloak)).createTeam(team));
  }

  /**
   * Update team
   * 
   * @param keycloak 
   * @param team 
   */
  updateTeam(keycloak: KeycloakInstance, team: Team):  Promise<Team> {
    return this.doRequest(keycloak, new TeamsApi(this.getConfig(keycloak)).updateTeam(team.id!, team));
  }

  /**
   * Delete team
   * 
   * @param keycloak 
   * @param teamId 
   */
  deleteTeam(keycloak: KeycloakInstance, teamId: string):  Promise<void> {
    return this.doRequest(keycloak, new TeamsApi(this.getConfig(keycloak)).deleteTeam(teamId));
  }

  /**
   * List products
   * 
   * @param keycloak 
   * @param firstResult 
   * @param maxResults 
   */
  listProducts(keycloak: KeycloakInstance, firstResult: number, maxResults: number): Promise<Product[]> {
    return this.doRequest(keycloak, new ProductsApi(this.getConfig(keycloak)).listProducts(firstResult, maxResults));
  }

  /**
   * Find product
   * 
   * @param keycloak 
   * @param teamId 
   */
  findProduct(keycloak: KeycloakInstance, teamId: string): Promise<Product> {
    return this.doRequest(keycloak, new ProductsApi(this.getConfig(keycloak)).findProduct(teamId));
  }

  /**
   * Create product
   * 
   * @param keycloak 
   * @param product 
   */
  createProduct(keycloak: KeycloakInstance, product: Product):  Promise<Product> {
    return this.doRequest(keycloak, new ProductsApi(this.getConfig(keycloak)).createProduct(product));
  }

  /**
   * Update product
   * 
   * @param keycloak 
   * @param product 
   */
  updateProduct(keycloak: KeycloakInstance, product: Product):  Promise<Product> {
    return this.doRequest(keycloak, new ProductsApi(this.getConfig(keycloak)).updateProduct(product.id!, product));
  }

  /**
   * Delete product
   * 
   * @param keycloak 
   * @param productId 
   */
  deleteProduct(keycloak: KeycloakInstance, productId: string):  Promise<void> {
    return this.doRequest(keycloak, new ProductsApi(this.getConfig(keycloak)).deleteProduct(productId));
  }

  /**
   * List package sizes
   * 
   * @param keycloak 
   * @param firstResult 
   * @param maxResults 
   */
  listPackageSizes(keycloak: KeycloakInstance, firstResult: number, maxResults: number): Promise<PackageSize[]> {
    return this.doRequest(keycloak, new PackageSizesApi(this.getConfig(keycloak)).listPackageSizes(firstResult, maxResults));
  }

  /**
   * Find package size
   * 
   * @param keycloak 
   * @param packageSizeId 
   */
  findPackageSize(keycloak: KeycloakInstance, packageSizeId: string): Promise<PackageSize> {
    return this.doRequest(keycloak, new PackageSizesApi(this.getConfig(keycloak)).findPackageSize(packageSizeId));
  }

  /**
   * Create package size
   * 
   * @param keycloak 
   * @param packageSize 
   */
  createPackageSize(keycloak: KeycloakInstance, packageSize: PackageSize):  Promise<PackageSize> {
    return this.doRequest(keycloak, new PackageSizesApi(this.getConfig(keycloak)).createPackageSize(packageSize));
  }

  /**
   * Update package size
   * 
   * @param keycloak 
   * @param packageSize 
   */
  updatePackageSize(keycloak: KeycloakInstance, packageSize: PackageSize):  Promise<PackageSize> {
    return this.doRequest(keycloak, new PackageSizesApi(this.getConfig(keycloak)).updatePackageSize(packageSize.id!, packageSize));
  }

  /**
   * Delete package size
   * 
   * @param keycloak 
   * @param packageSizeId 
   */
  deletePackageSize(keycloak: KeycloakInstance, packageSizeId: string):  Promise<void> {
    return this.doRequest(keycloak, new PackageSizesApi(this.getConfig(keycloak)).deletePackageSize(packageSizeId));
  }

  /**
   * Check validation of given keycloak's token
   * 
   * @param keycloak 
   */
  checkTokenValidity(keycloak: KeycloakInstance) {
    return new Promise((resolve, reject) => {
      keycloak.updateToken(5).success(() => {
        resolve();
      }).error(() => {
        reject();
      })
    });
  }

  /**
   * Do request
   * 
   * @param keycloak 
   * @param request 
   */
  async doRequest(keycloak: KeycloakInstance, request: Promise<any>) {
    try {
      await this.checkTokenValidity(keycloak);
      return request;
    } catch(e) {
      return Promise.reject(e);
    }
  }
}