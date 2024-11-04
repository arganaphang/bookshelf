import type { IRepositories } from "@/repositories";

export default class BookService {
  #repositories: IRepositories;

  constructor(repositories: IRepositories) {
    this.#repositories = repositories;
  }
}
