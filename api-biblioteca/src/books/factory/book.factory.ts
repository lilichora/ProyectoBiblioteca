// src/books/factory/book.factory.ts
import { Book } from '../entities/entities';

export interface IBookFactory {
  createBook(data: CreateBookDTO): Book;
}

export class BookFactory implements IBookFactory {
  createBook(data: CreateBookDTO): Book {
    const book = new Book();
    book.title = data.title;
    book.availability = data.availability ?? true;
    book.location = data.location;
    book.category = data.category;
    book.author = data.author;
    book.isbn = data.isbn;
    book.quantity = data.quantity;
    return book;
  }
}

export interface CreateBookDTO {
  title: string;
  availability?: boolean;
  location: string;
  category: string;
  author: string;
  isbn: string;
  quantity: number;
}
