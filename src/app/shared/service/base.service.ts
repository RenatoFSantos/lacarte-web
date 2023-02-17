import { environment } from "src/environments/environment";
import { iResultHttp } from "../interface/iResultHttp";
import { HttpService } from "./http.service";

export abstract class BaseService<T> {

  urlBase: string = '';

  constructor(
    public url: string,
    public http: HttpService
  ) {
    this.urlBase = `${environment.apiPath}/${this.url}`;
  }

  public getAll(): Promise<iResultHttp> {
    return this.http.get(this.urlBase);
  }

  public getById(id: string): Promise<iResultHttp> {
    return this.http.get(`${this.urlBase}/${id}`);
  }

  public post(model: T): Promise<iResultHttp> {
    return this.http.post(this.urlBase, model);
  }

  public delete(id: string): Promise<iResultHttp> {
    return this.http.delete(`${this.urlBase}/${id}`);
  }

  // --- Utilities Functions
  
  public convertMilesecondsInHours(ms: number) {
    // let seconds = Math.trunc((ms / 1000) % 60);
    let minutes = Math.trunc((ms / 60000) % 60);
    let hours = Math.trunc((ms / 3600000));
    let duration = `${(hours < 10 ? "0" + hours : hours)}:${(minutes < 10 ? "0" + minutes : minutes)}`;
    return duration
  }
}
