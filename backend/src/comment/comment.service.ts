import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/crypto.service';
import {
  CommentResDto,
  CreateCommentDto,
  DeleteCommentDto,
} from './comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async createComment(
    postId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentResDto> {
    const hashedPassword = await this.cryptoService.hash(
      createCommentDto.password,
    );

    const comment = await this.prismaService.comment.create({
      data: { ...createCommentDto, password: hashedPassword, postId },
    });

    return comment;
  }

  async deleteComment(
    postId: number,
    id: number,
    dto: DeleteCommentDto,
  ): Promise<void> {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });
    if (!comment || comment.postId !== postId)
      throw new NotFoundException('comment not found');
    const ok = await this.cryptoService.compare(dto.password, comment.password);
    if (!ok) throw new ForbiddenException('wrong password');

    await this.prismaService.comment.delete({ where: { id } });
  }
}
