import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createdComment(
    inputData: {
      content: string,
      nestedComment: string,
    },
    authorId: string,
    diary_id: string,
    ){
      try {
          const { content, nestedComment } = inputData 
          const comment = await prisma.comment.create({
              data: { diaryId: diary_id, authorId, content, nestedComment }
          });
          return comment;
      } catch(error) {
          throw error;
      }
    }

export async function getCommentByDiaryId(
    diary_id: string,
    ){
      try {
          const comment = await prisma.comment.findMany({
              where: { diaryId: diary_id },
              select: {
                  id: true,
                  author: {
                      select: {
                          id: true,
                          username: true,
                          profileImage: true,
                      }
                  },
                  diaryId: true,
                  content: true,
                  nestedComment: true,
                  createdAt: true,
                  updatedAt: true,
              },
              orderBy: { createdAt: 'asc'}
          });
          return { data: comment };
      } catch(error) {
          throw error;
      }
    }

export async function updatedComment(
  inputData: {
    content: string,
  },
  comment_id: string,
  authorId: string,
  ){
    try {
        const userCheck = await prisma.comment.findUnique({
            where: { id: comment_id }
        })

        if (userCheck.authorId == authorId) {
            const comment = await prisma.comment.update({
                where: { id: comment_id },
                data: inputData
            });
            return { data: comment };
        } else {
            return { message: '작성자가 아니므로 수정이 불가합니다.' }
        }

    } catch(error) {
        throw error;
    }
  }

export async function deletedComment(
  comment_id: string,
  authorId: string,
  ){
    try {
        const userCheck = await prisma.comment.findUnique({
          where: { id: comment_id }
        })
        if (userCheck.authorId == authorId) {
            await prisma.comment.deleteMany({
                where: { id: comment_id }
            });
            await prisma.comment.deleteMany({
                where: { nestedComment: comment_id }
            });
            return { message: '해당 댓글을 삭제했어요!' }
      } else {
          return { message: '작성자가 아니므로 삭제가 불가합니다.' }
      }

    } catch(error) {
        throw error;
    }
  }