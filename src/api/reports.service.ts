
export class ReportsService {

  private token: string;
  private basePath: string;

  constructor(basePath: string, token: string) {
    this.token = token;
    this.basePath = basePath;
  }


  /**
   * 
   * @summary Constructs report
   * @param type Report type
  */
  public getReport(type: string, ):Promise<string> {
    const url = new URL(`${this.basePath}/v1/reports/${encodeURIComponent(String(type))}`);
    const options = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(url.toString(), options).then((response) => {
      return this.handleResponse(response);
    });
  }

  /**
   * Handle response from API
   * 
   * @param response response object
   */
  public handleResponse(response: any) {
    switch (response.status) {
      case 204:
        return {};
      default:
        return response.json();
    }
  }

}