import { PrintData, Printer } from "famifarm-typescript-models";
import { Api } from ".";
import * as URI from "urijs";


export class PrintersService {
    private token: string;
    private basePath: string;
  
    constructor(basePath: string, token: string) {
      this.token = token;
      this.basePath = basePath;
    }


    /**
     * 
     * @summary Prints a packing label
     * @param body JSON object that contains packing id
     * @param printerId printer id
     */
    public print(body: PrintData, printerId: string): Promise<void> {
        const uri = new URI(`${this.basePath}/v1/printers/${printerId}/print`);
        const options = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`
          },
          body: JSON.stringify(body)
        };
    
        return fetch(uri.toString(), options).then((response) => {
          return Api.handleResponse(response, true);
        });
    }

    /**
     * @summary Returns all connected printers
     * @returns All connected printers
     */
    public listPrinters(): Promise<Array<Printer>> {
        const uri = new URI(`${this.basePath}/v1/printers`);
        const options = {
          method: "get",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`
          }
        };
    
        return fetch(uri.toString(), options).then((response) => {
          return Api.handleResponse(response);
        });
    }
}