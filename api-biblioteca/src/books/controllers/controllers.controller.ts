// src/books/controllers/books.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { BooksService } from '../services/services.service';
import { CreateBookDTO } from '../factory/book.factory';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../users/factory/user.factory';

@Controller('libros')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}
  // Crear un nuevo libro
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserType.ADMIN)
  async createBook(@Body() createBookDto: CreateBookDTO) {
    return await this.booksService.createBook(createBookDto);
  }

  // Ruta para búsqueda por título o categoría y listar todos
  @Get()
  async getBooks(
    @Query('titulo') titulo?: string,
    @Query('categoria') categoria?: string,
  ) {
    if (titulo) {
      return await this.booksService.getBooksByTitle(titulo);
    } 
    if (categoria) {
      return await this.booksService.getBooksByCategory(categoria);
    }
    return await this.booksService.getAllBooks();
  }

  // Buscar libro por ID
  @Get(':id')
  async getBookById(@Param('id') id: string) {
    return await this.booksService.getBookDetailsById(id);
  }

  // Actualizar un libro
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserType.ADMIN)
  async updateBook(
    @Param('id') id: string,
    @Body() updateBookDto: Partial<CreateBookDTO>,
  ) {
    return await this.booksService.updateBook(id, updateBookDto);
  }

  // Eliminar un libro
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserType.ADMIN)
  async deleteBook(@Param('id') id: string) {
    await this.booksService.deleteBook(id);
    return { message: `Libro con ID ${id} eliminado correctamente` };
  }
}
