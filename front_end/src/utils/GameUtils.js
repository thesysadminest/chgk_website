import axiosInstance from '../components/axiosInstance';

/**
 * �������� ������� ��� ���� � ����������� �� ������
 * @param {string} mode - ����� ���� ('random' ��� 'select')
 * @param {number|null} packId - ID ������ (��� ������ 'select')
 * @returns {Promise<Object>} ������ � ������� ��� ������ ����
 */
export const selectQuestions = async (mode, packId = null) => {
  try {
    if (mode === 'random') {
      const response = await axiosInstance.get('/game/random/');
      const randomPack = response.data;
      
      const gameResponse = await axiosInstance.post(`/game/${randomPack.id}/start/`);
      
      return {
        packId: randomPack.id,
        userId: gameResponse.data.user_id,
        attemptId: gameResponse.data.attempt_id,
        firstQuestionId: gameResponse.data.first_question_id,
        packName: randomPack.name
      };
    }
    else if (mode === 'select' && packId) {
      console.debug(`Fetching pack ${packId} questions...`);
      const response = await axiosInstance.get(`/game/${packId}/`);
      
      return {
        packId: packId,
        firstQuestionId: response.data.questions[0]?.id || null,
        selectMode: false,
        packName: response.data.name
      };
    }
    else if (mode === 'select') {
      console.debug('Fetching all questions for selection...');
      const response = await axiosInstance.get('/game/questions/all/', {
        params: {
          page_size: 1000 // �������� ��� ������� �����
        }
      });
      
      return {
        questions: response.data.results || response.data,
        selectMode: true
      };
    }
    
    const error = new Error(`Unknown game mode: ${mode}`);
    console.error('Invalid game mode:', error);
    throw error;
  } catch (error) {
    console.error('Error in selectQuestions:', {
      error: error.response?.data || error.message,
      config: error.config,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * ������� ������� ������ � ���������� ���������
 * @param {Array<number>} selectedQuestions - ������ ID ��������� ��������
 * @returns {Promise<Object>} ������ ��� ������ ����
 */
export const startSelectedQuestionsGame = async (selectedQuestions) => {
  try {
    console.debug(`Starting game with ${selectedQuestions.length} selected questions`);
    
    if (!selectedQuestions || selectedQuestions.length === 0) {
      const error = new Error('No questions selected for the game');
      console.error('Validation error:', error);
      throw error;
    }

    console.debug('Creating custom game ...');
    const response = await axiosInstance.post('/game/custom/create/', {
      questions: selectedQuestions,
      is_custom: true
    });

    console.debug('Game created:', response.data);
    return {
      packId: 0,
      userId: response.data.user_id,
      attemptId: response.data.attempt_id,
      firstQuestionId: response.data.first_question_id,
      totalQuestions: selectedQuestions.length
    };
  } catch (error) {
    console.error('Error in startSelectedQuestionsGame:', {
      error: error.response?.data || error.message,
      requestData: {
        questions: selectedQuestions,
        is_custom: true
      },
      stack: error.stack
    });
    throw error;
  }
};

/**
 * �������� ������ ���� �������� � ����������
 * @param {number} page - ����� ��������
 * @param {number} pageSize - ���������� �������� �� ��������
 * @returns {Promise<Object>} ������ �������� � ���������� ���������
 */
export const fetchAllQuestions = async (page = 1, pageSize = 50) => {
  try {
    console.debug(`Fetching questions page ${page}, size ${pageSize}`);
    const response = await axiosInstance.get('/game/questions/all/', {
      params: {
        page,
        page_size: pageSize
      }
    });
    
    return {
      questions: response.data.results || response.data,
      totalCount: response.data.count || response.data.length,
      page,
      pageSize
    };
  } catch (error) {
    console.error('Error in fetchAllQuestions:', {
      error: error.response?.data || error.message,
      params: { page, pageSize },
      stack: error.stack
    });
    throw error;
  }
};

export const startGame = async ({ packId, questionIds }) => {
  try {
    let endpoint = `/game/${packId}/start/`;
    let data = {};

    if (packId) {
      endpoint = `/game/${packId}/start/`;
    } else if (questionIds) {
      data = { questions: questionIds, is_custom: true };
    } else {
      throw new Error('�� ������ packId ��� questionId');
    }

    const response = await axiosInstance.post(endpoint, data);
    
    return {
      packId: response.data.pack_id || 0,
      firstQuestionId: response.data.first_question_id,
      attemptId: response.data.attempt_id
    };
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
};