import { NextFunction, Response } from 'express';
import {
  createDiaryService,
  deleteDiaryService,
  getAllDiaryService,
  getOneDiaryService,
  getDiaryByMonthService,
  getAllMyDiariesService,
  updateDiaryService,
  getFriendsDiaryService,
  // mailService,
  selectedEmojis,
  searchDiaryService,
  getDiaryByDateService,
  verifyDiaryAuthor,
  getEmotionOftheMonthService,
} from '../services/diaryService';
import { IRequest } from '../types/request';
import { plainToClass } from 'class-transformer';
import { DiaryValidateDTO } from '../dtos/diaryDTO';
import { validate } from 'class-validator';
import { generateError } from '../utils/errorGenerator';
import { getMyWholeFriends } from '../services/friendService';
import {
  createdGPTComment,
  updatedGPTComment,
} from '../services/commentService';
import { wrapAsyncController } from '../utils/wrapper';
import axios from 'axios';

/**
 * 다이어리 생성
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const createDiary = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  /**
   * #swagger.tags = ['Diary']
   * #swagger.security = [{
   *            "bearerAuth": []
   *          }]
   * #swagger.summary = '다이어리 작성'
   */
  const fileUrls = res.locals.myData;
  const {
    body: inputData,
    user: { id: userId },
  } = req;

  const { createdDate } = inputData;

  // 해당 날짜에 다이어리 존재하는지 체크
  const checkExistedDiary = await getDiaryByDateService(userId, createdDate);

  if (checkExistedDiary) {
    throw generateError(409, '해당 날짜에 이미 일기가 존재합니다.');
  }
  const diaryInput = plainToClass(DiaryValidateDTO, inputData);

  const errors = await validate(diaryInput);

  if (errors.length > 0) {
    throw generateError(500, '양식에 맞춰서 입력해주세요');
  }

  const createdDiary = await createDiaryService(userId, inputData, fileUrls);

  // 일기 작성시 chatGPT를 활용한 댓글 한마디 추가
  // createdGPTComment(inputData.content, userId, createdDiary.data.id, next);
  const inputAI = {
    content: inputData.content,
    userId: userId,
    diaryId: createdDiary.data.id,
  };
  req.inputAI = inputAI;
  next();
  return res.status(createdDiary.status).json(createdDiary);
};

/**
 * 내 글 가져오기
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const getAllMyDiaries = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  /**
   * #swagger.tags = ['Diary']
   * #swagger.security = [{
   *            "bearerAuth": []
   *          }]
   * #swagger.summary = '나의 모든 글 가져오기'
   */
  const { id: userId } = req.user;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const myDiaries = await getAllMyDiariesService(userId, page, limit);

  return res.status(myDiaries.status).json(myDiaries);
};

export const getDiaryByMonth = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  /**
   * #swagger.tags = ['Diary']
   * #swagger.security = [{
   *            "bearerAuth": []
   *          }]
   * #swagger.summary = '한달 다이어리 가져오기 '
   */
  const { userId } = req.params;
  const year = parseInt(req.query.year as string);
  const month = parseInt(req.query.month as string);
  const MonthlyDiary = await getDiaryByMonthService(userId, year, month);

  return res.status(MonthlyDiary.status).json(MonthlyDiary);
};
/**
 * 다이어리 하나 가져오기 (diaryId)
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const getOneDiary = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  const {
    params: { diaryId },
    user: { id: userId },
  } = req;
  /**
   * #swagger.tags = ['Diary']
   * #swagger.security = [{
   *            "bearerAuth": []
   *          }]
   * #swagger.summary = '다이어리 하나 불러오기 '
   */
  const diary = await getOneDiaryService(userId, diaryId);

  return res.status(diary.status).json(diary);
};

/**
 * 다른 유저(친구 or 모든 유저)의 다이어리 가져오기
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const getOtherUsersDiary = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  /**
   * #swagger.tags = ['Diary']
   * #swagger.security = [{
   *            "bearerAuth": []
   *          }]
   * #swagger.summary = '다른 사람의 다이어리 가져오기'
   */
  const {
    query: { select, emotion },
    user: { id: userId },
  } = req;

  const decodedEmotion = decodeURIComponent(emotion as string);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  //친구목록 가져오기
  const friends = await getMyWholeFriends(userId);

  const friendIdList = friends.map((friend) => {
    return userId == friend.sentUserId
      ? friend.receivedUserId
      : friend.sentUserId;
  });

  // diary 데이터 가져오기
  const otherUsersDiary =
    select == 'friend'
      ? await getFriendsDiaryService(page, limit, decodedEmotion, friendIdList)
      : await getAllDiaryService(
          userId,
          page,
          limit,
          decodedEmotion,
          friendIdList,
        );

  return res.status(otherUsersDiary.status).json(otherUsersDiary);
};

/**
 * @description 다이어리 업데이트
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const updateDiary = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  /**
   * #swagger.tags = ['Diary']
   * #swagger.security = [{
   *            "bearerAuth": []
   *          }]
   * #swagger.summary = '다이어리 업데이트'
   */
  const {
    body: inputData,
    params: { diaryId },
    user: { id: userId },
  } = req;
  const { deleteData, ...updatedData } = inputData;

  await verifyDiaryAuthor(diaryId, userId);

  const diaryInput = plainToClass(DiaryValidateDTO, updatedData);

  const errors = await validate(diaryInput);

  if (errors.length > 0) {
    throw generateError(500, '양식에 맞춰서 입력해주세요');
  }

  const updatedDiary = await updateDiaryService(userId, diaryId, inputData);

  const inputAI = {
    content: inputData.content,
    userId: userId,
    diaryId: updatedDiary.data.id,
  };

  req.inputAI = inputAI;

  next();
  return res.status(updatedDiary.status).json(updatedDiary);
};

/**
 * @description 다이어리 삭제
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const deleteDiary = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  /**
   * #swagger.tags = ['Diary']
   * #swagger.security = [{
   *            "bearerAuth": []
   *          }]
   * #swagger.summary = '다이어리 삭제'
   */
  const {
    params: { diaryId },
    user: { id: userId },
  } = req;

  await verifyDiaryAuthor(diaryId, userId);

  const deletedDiary = await deleteDiaryService(userId, diaryId);

  return res.status(deletedDiary.status).json(deletedDiary);
};

// export const sendRecommendationEmail = async (
//   req: IRequest,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { diaryId } = req.params;
//   const { username } = req.user;
//   const { friendEmail } = req.body;

//   const sendMail = await mailService(friendEmail, diaryId, username);

//   return res.status(sendMail.status).json(sendMail);
// };

export const selectEmotion = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  /**
   * #swagger.tags = ['Diary']
   * #swagger.security = [{
   *            "bearerAuth": []
   *          }]
   * #swagger.summary = '감정 선택 '
   */
  const { diaryId } = req.params;
  const { id: userId } = req.user;
  const { selectedEmotion, selectedEmoji } = req.body;

  await verifyDiaryAuthor(diaryId, userId);

  const updatedDiary = await selectedEmojis(
    selectedEmotion,
    selectedEmoji,
    diaryId,
    userId,
  );

  return res.status(updatedDiary.status).json(updatedDiary);
};

/**
 * @description 다이어리 검색 기능
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const searchDiary = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  /**
   * #swagger.tags = ['Diary']
   * #swagger.security = [{
   *            "bearerAuth": []
   *          }]
   * #swagger.summary = '다이어리 검색
   */
  const {
    user: { id: userId },
  } = req;

  const friends = await getMyWholeFriends(userId);

  const friendIdList = friends.map((friend) => {
    return userId == friend.sentUserId
      ? friend.receivedUserId
      : friend.sentUserId;
  });

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;
  const { search } = req.query;
  const searchDiary = await searchDiaryService(
    userId,
    search as string,
    page,
    limit,
    friendIdList,
  );

  return res.status(searchDiary.status).json(searchDiary);
};

export const getEmotionOftheMonth = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  /**
   * #swagger.tags = ['Diary']
   * #swagger.security = [{
   *            "bearerAuth": []
   *          }]
   * #swagger.summary = '한달 중 가장 많이 도출된 감정 가져오기'
   */
  const {
    user: { id: userId },
  } = req;
  const year = parseInt(req.query.year as string);
  const month = parseInt(req.query.month as string);
  const emotion = await getEmotionOftheMonthService(userId, year, month);

  return res.status(200).json(emotion);
};
