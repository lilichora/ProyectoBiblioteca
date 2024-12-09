// src/books/services/books.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,Like } from 'typeorm';

import { Book } from '../entities/entities';
import { BookFactory, CreateBookDTO } from '../factory/book.factory';

@Injectable()
export class BooksService {
  private bookFactory: BookFactory;

  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {
    this.bookFactory = new BookFactory();
  }

  // Crear un nuevo libro
  async createBook(createBookDto: CreateBookDTO): Promise<Book> {
    const book = this.bookFactory.createBook(createBookDto);
    return await this.booksRepository.save(book);
  }

  // Obtener todos los libros
  async getAllBooks(): Promise<Book[]> {
    return await this.booksRepository.find();
  }

  // Obtener un libro por ID
  async getBookById(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    return book;
  }

  // Actualizar un libro
  async updateBook(id: string, updateBookDto: Partial<CreateBookDTO>): Promise<Book> {
    const book = await this.getBookById(id);
    Object.assign(book, updateBookDto);
    return await this.booksRepository.save(book);
  }

  // Eliminar un libro
  async deleteBook(id: string): Promise<void> {
    const result = await this.booksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
  }
  // Obtener detalles del libro por ID
  async getBookDetailsById(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    return book;
  }

  // Obtener libros por título
  async getBooksByTitle(title: string): Promise<Book[]> {
    return await this.booksRepository.find({
      where: { title: Like(`%${title}%`) },
    });
  }

  // Obtener libros por categoría
  async getBooksByCategory(category: string): Promise<Book[]> {
    return await this.booksRepository.find({
      where: { category },
    });
  }
}
