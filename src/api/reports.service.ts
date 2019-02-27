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
   * @param fromTime From time of the report
   * @param toTime To time of the report
  */
  public getReport(type: string, fromTime?: string, toTime?: string, ):Promise<Blob> {
    const url = new URL(`${this.basePath}/v1/reports/${encodeURIComponent(String(type))}`);
    let queryParameters = new URLSearchParams();
    if (fromTime !== undefined && fromTime !== null) {
      queryParameters.set('fromTime', <any>fromTime);
    }
    if (toTime !== undefined && toTime !== null) {
      queryParameters.set('toTime', <any>toTime);
    }
    url.search = queryParameters.toString();
    const options = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(url.toString(), options).then((response) => {
      return response.blob();
    });
  }

}