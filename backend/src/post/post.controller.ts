import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, DeletePostDto, PostResDto } from './post.dto';

@Controller('post')
export class PostsController {
  constructor(private readonly postService: PostService) {}

  // Create a new post
  @Post()
  createPost(@Body() createPostDto: CreatePostDto): Promise<PostResDto> {
    return this.postService.createPost(createPostDto);
  }

  // Get all posts
  @Get()
  getAllPosts(): Promise<PostResDto[]> {
    return this.postService.getPosts();
  }

  // Get posts by keyword
  @Get()
  searchPosts(@Query('keyword') keyword: string): Promise<PostResDto[]> {
    return this.postService.getPosts(keyword);
  }

  // Get a single post by post ID
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number): Promise<PostResDto> {
    return this.postService.getPost(id);
  }

  // Delete a post by post ID
  @Delete(':id')
  deletePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() deletePostDto: DeletePostDto,
  ): Promise<void> {
    return this.postService.deletePost(id, deletePostDto);
  }
}
