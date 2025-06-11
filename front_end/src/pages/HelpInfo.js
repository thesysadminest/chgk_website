import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  useTheme, 
  Link,
  Stack,
  Button,
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const HELP_SECTIONS = [
  'about',
  'what-is-chgk',
  'basic-rules',
  'game-mode-rules',
  'faq'
];


const HelpInfo = () => {
  const theme = useTheme();
  const { section } = useParams();
  const navigate = useNavigate();
  const [titlePosition, setTitlePosition] = useState('left');

  useEffect(() => {
    const currentIndex = HELP_SECTIONS.indexOf(section);
    const totalSections = HELP_SECTIONS.length;
    const position = (currentIndex / (totalSections)) * 100;
    setTitlePosition(position);
  }, [section]);

  // Навигация между разделами
  const navigateToAdjacentSection = (direction) => {
    const currentIndex = HELP_SECTIONS.indexOf(section);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? HELP_SECTIONS.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === HELP_SECTIONS.length - 1 ? 0 : currentIndex + 1;
    }
    
    navigate(`/help/${HELP_SECTIONS[newIndex]}`);
  };

  const getContent = () => {
    switch (section) {
    case "about":
      return {
        title: "О нашем проекте",
        content: (
          <>
            <Typography sx={{color: theme.palette.text.dark}}>
              Добро пожаловать на платформу интеллектуальных игр "ЧГК Рейтинг"!
            </Typography>
            
            <Typography variant="body1" sx={{color: theme.palette.text.dark}}>
              Мы создаём пространство для развития интеллектуального сообщества, где каждый может:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 1, color: theme.palette.text.dark}}>
              <li>Играть в "Что? Где? Когда?" онлайн</li>
              <li>Тренироваться с вопросами разных уровней сложности</li>
              <li>Создавать собственные вопросы и пакеты</li>
              <li>Общаться с единомышленниками</li>
            </Box>        
          </>
        )
      };

    case "what-is-chgk":
      return {
        title: "Об игре ''Что? Где? Когда?''",
        content: (
          <>
            <Typography variant="body1" sx={{color: theme.palette.text.dark}}>
              "Что? Где? Когда?" — легендарная интеллектуальная игра, покорившая миллионы людей по всему миру. Она была создана в 1975 году телеведущим Владимиром Ворошиловым и редактором Наталией Стеценко. Спортивная версия "ЧГК" появилась в 1989 году в СССР.
            </Typography>

            <Accordion sx={{ mb: 1, backgroundColor: theme.palette.background.disabled}}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{color: theme.palette.primary.main}}>Телевизионная версия</Typography>
              </AccordionSummary>
              <AccordionDetails>
                
                <Box sx={{ pl: 3, mb: 1, color: theme.palette.text.dark}}>
                  <li><strong>Команда из 6 знатоков</strong> отвечает на вопросы телезрителей за игровым столом.</li>
                  <li>У знатоков есть <strong>1 минута</strong> на обсуждение каждого вопроса.</li>
                  <li>По истечении минуты знатоки дают ответ на вопрос ведущему <strong>в свободной форме.</strong></li>
                  <li>За <strong>правильный ответ</strong> знатоки получают 1 очко.</li>
                  <li>Автор вопроса, на который знатоки <strong>не ответили</strong>, получает денежный приз. Команда телезрителей получает 1 очко.</li>
                  <li>Игра ведётся <strong>до 6 очков</strong>.</li>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{backgroundColor: theme.palette.background.disabled}}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{color: theme.palette.primary.main}}>Спортивная версия</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph sx={{color: theme.palette.text.dark}}>
                  В спортивном ЧГК традиционно более строгие правила для турнирных соревнований.
                </Typography>
                <Box sx={{ pl: 3, mb: 2, color: theme.palette.text.dark}}>
                  <li>Состав команды - <strong>до 6 игроков + запасные.</strong></li>
                  <li>Команды телезрителей нет. Одну игру одновременно играют <strong>несколько команд знатоков.</strong></li>
                  <li>Число вопросов может варьироваться <strong>от 24 до 50.</strong></li>
                  <li>Ответы сдаются <strong>в письменном виде</strong> на специальных карточках и строго <strong>по форме.</strong></li>
                  <li>Знатокам даётся <strong>1 минута + 10 секунд</strong> на запись ответа</li>
                  <li>В игре побеждает команда с наибольшим количеством правильных ответов.</li>
                </Box>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  Именно спортивная версия легла в основу нашей онлайн-платформы.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
        )
      };

    case "basic-rules":
      return {
        title: "Правила базового режима",
        content: (
          <>
            <Typography variant="body1" sx={{color: theme.palette.text.dark}}>
              Базовый режим предназначен для тренировки и знакомства с игрой.
            </Typography>

            <Typography sx={{color: theme.palette.text.dark, mb: -2}}>
              Основные особенности:
            </Typography>
            <Box component="ul" sx={{ pl: 2, color: theme.palette.text.dark }}>
              <li>Вопросы без ограничения по времени</li>
              <li>Ответы не влияют на рейтинг</li>
              <li>Возможность играть пакеты частями</li>
              <li>Тренировки в любое удобное время</li>
            </Box>
            

            <Box sx={{ 
                   backgroundColor: theme.palette.background.disabled,
                   p: 3,
                   borderRadius: 2,
                   mb: 3,
                   borderLeft: `4px solid ${theme.palette.primary.main}`
                 }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                Важно
              </Typography>
              <Typography variant="body1" sx={{color: theme.palette.text.dark}}>
                Будьте вежливы. Просим Вас воздержаться от создания вопросов на острые социальные и политические темы. Недопустима дискриминация, ненормативная лексика, политическая пропаганда. Весь контент модерируется в течение 3-5 рабочих дней с момента публикации.
              </Typography>
            </Box>
          </>
        )
      };

    case "game-mode-rules":
      return {
        title: "Правила игрового режима",
        content: (
          <>
            <Typography variant="body1" sx={{color: theme.palette.text.dark}}>
              Данный формат предназначен для погружения в атмосферу игры.
            </Typography>

            <Box component="ul" sx={{ pl: 2, color: theme.palette.text.dark }}>
              <li>Вопросы с ограничением по времени</li>
              <li>Ответы влияют на личный рейтинг и рейтинг команды</li>
              <li>Пакет играется целиком</li>
              <li>При досрочном выходе из режима игры рейтинг снимается</li>
              <li>Нажмите "Играть", чтобы проверить свои силы</li>
            </Box>
            
          </>
        )
      };

    case "faq":
      return {
        title: "Частые вопросы",
        content: (
          <>
            <Typography variant="body1" sx={{ mb: 1, color: theme.palette.text.dark}}>
              Здесь собраны ответы на самые популярные вопросы о платформе.
            </Typography>

            <Accordion sx={{backgroundColor: theme.palette.background.disabled}}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{color: theme.palette.primary.main}}>
                <Typography variant="h6">Как добавить вопрос?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{color: theme.palette.text.dark}}>
                  1. Перейдите в раздел "Вопросы" в боковом меню<br />
                  2. С помощью кнопки + или "новый вопрос" перейдите к процедуре создания<br />
                  3. Заполните все обязательные поля<br />
                  4. Дождитесь прохождения модерации<br />
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{backgroundColor: theme.palette.background.disabled}}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{color: theme.palette.primary.main}}>
                <Typography variant="h6">Как создать команду?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="ul" sx={{color: theme.palette.text.dark}}>
                  1. Перейдите в раздел "Моя команда"<br />
                  2. Нажмите "Создать команду"<br />
                  3. Заполните информацию о команде<br />
                  4. Пригласите участников через ссылку-приглашение<br /><br/>
                  Максимальный размер команды — 6 человек.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{backgroundColor: theme.palette.background.disabled}}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{color: theme.palette.primary.main}}>
                <Typography variant="h6">На чём сидели авторы сайта?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{color: theme.palette.text.dark}}>
                  :)
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
      )
    };

    default:
    return {
      title: "Раздел не найден",
      content: (
        <Box sx={{ 
               textAlign: 'center',
               py: 4,
               backgroundColor: theme.palette.background.paper,
               borderRadius: 2
             }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Такой страницы не существует
          </Typography>
          <Typography variant="body1">
            Попробуйте выбрать другой раздел из меню помощи
          </Typography>
          <Link href="/help" sx={{ mt: 2, display: 'inline-block' }}>
            Вернуться к списку разделов
          </Link>
        </Box>
      )
    };
  }
};

const { title, content } = getContent();

//document.getElementById("mainbox").style.backgroundColor = "yellow";

return (
  <>
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={4}
           sx={{height: `calc(100vh - ${theme.drawers.drawerHeight}px - 8*16px)`,
                maxHeight: `calc(100vh - ${theme.drawers.drawerHeight}px - 8*16px)`}}
    >

      <Button
        onClick={() => navigateToAdjacentSection('prev')}
        sx={{
          height: "10vh",
          minHeight: "50px",
          backgroundColor: theme.palette.background.window,
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: 'white',
          },
          boxShadow: theme.shadows[4],
        }}
      >
        <ChevronLeft />
      </Button>


      <Box
        sx={{
          maxHeight: "inherit",
          overflowY: "auto",
          width: "60vw",
          mx: "auto",
          p: { md: 4 },
          backgroundColor: theme.palette.background.window,
          borderRadius: 4,
          boxShadow: theme.shadows[2],
        }}
      >

        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4, 
            color: theme.palette.primary.main,
            fontWeight: 500,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              //left: `${8 * HELP_SECTIONS.indexOf(section)}vw`,
              left: `calc(${HELP_SECTIONS.indexOf(section)} * (8px + ((100% - 4*8px)/5.0)))`,
              width: `calc((100% - 4*8px)/5.0)`,
              height: 4,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 2,
              transition: 'left 0.3s ease',
              zIndex: 2
            }
          }}
        >
          <strong>{title}</strong>
          {/* Статичные белые полоски */}
          <Box sx={{
                 position: 'absolute',
                 bottom: -8,
                 left: 0,
                 right: 0,
                 height: 4,
                 display: 'flex',
                 justifyContent: 'space-between',
                 zIndex: 1
               }}>
            {[...Array(5)].map((_, index) => (
              <Box 
                key={index}
                sx={{
                  width: `calc((100% - 4*8px)/5.0)`,
                  height: '100%',
                  backgroundColor: 'white',
                  borderRadius: 2
                }}
              />
            ))}
          </Box>
        </Typography>
        
        <Box sx={{ 
               display: 'flex', 
               flexDirection: 'column', 
               gap: 3,
               '& ul': {
                 pl: 3,
                 mb: 0
               },
               '& li': {
                 mb: 1
               }
             }}>
          {content}
        </Box>
      </Box>
      <Button
        onClick={() => navigateToAdjacentSection('next')}
        sx={{
          height: "10vh",
          minHeight: "50px",
          backgroundColor: theme.palette.background.window,
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: 'white'
          },
          boxShadow: theme.shadows[4],
        }}
      >
        <ChevronRight />
      </Button>

    </Stack>
  </>
);
};

export default HelpInfo;
