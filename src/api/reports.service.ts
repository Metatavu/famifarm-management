import * as URI from "urijs";
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
    const uri = new URI(`${this.basePath}/v1/reports/${encodeURIComponent(String(type))}`);
    if (fromTime !== undefined && fromTime !== null) {
        uri.addQuery('fromTime', <any>fromTime);
    }
    if (toTime !== undefined && toTime !== null) {
        uri.addQuery('toTime', <any>toTime);
    }
    const options = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      }
    };

    return fetch(uri.toString(), options).then((response) => {
      return response.blob();
    });
  }

}