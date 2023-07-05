import React from "react";
import { decode } from "html-entities";
import { v4 as uuidv4 } from "uuid";

export default function Quiz() {
  const [gameState, setGameState] = React.useState(false);

  const [buttonState, setButtonState] = React.useState(false);

  const [questions, setQuestions] = React.useState([]);

  const [optionsArr, setOptionsArr] = React.useState([]);

  const [correctAnswers, setCorrectAnswers] = React.useState([]);

  const [selectedAnswers, updateSelectedAnswers] = React.useState([]);

  const [correctAnswersNumber, updateCorrectAnswersNumber] = React.useState(0);

  function startGame() {
    setGameState(true);
  }

  function startingCode() {
    return (
      <div className="start-text-area">
        <h1>Quizzical</h1>
        <p>
          Ignite your curiosity and immerse yourself in the excitement of our
          brain-teasing QuizApp!
        </p>
        <button onClick={startGame} className="start-btn">
          Start quiz
        </button>
      </div>
    );
  }

  async function getQuestions() {
    const call = await fetch(
      "https://opentdb.com/api.php?amount=5&type=multiple"
    );
    const data = await call.json();
    return data.results;
  }

  React.useEffect(() => {
    let isMounted = true;

    async function getData() {
      const data = await getQuestions();
      const questionsWithIds = data.map((question) => ({
        ...question,
        question: decode(question.question),
        id: uuidv4(),
        isSelected: false,
      }));

      questionsWithIds.forEach((question) => {
        let options = question.incorrect_answers;
        options.push(question.correct_answer);
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
        question.options = options.map((option) => ({
          option,
          key: uuidv4(),
          isSelected: false,
        }));
      });
      console.log(questionsWithIds)
      if (isMounted) {
        setQuestions(questionsWithIds);
      }
    }

    getData();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    const updateAnswersState = questions.map((question, index) => {
      const updateOptions = question.options.map((option) => {
        if (correctAnswers[index] === selectedAnswers[index]) {
          if (option.option === correctAnswers[index]) {
            const updatedOption = {
              ...option,
              correct: true,
            };
            return updatedOption;
          } else return option;
        } else if (selectedAnswers[index] !== correctAnswers[index]) {
          if (option.option === selectedAnswers[index]) {
            const updateOption = {
              ...option,
              correct: false,
            };
            return updateOption;
          } else if (option.option === correctAnswers[index]) {
            const updateOption = {
              ...option,
              actualAns: true,
            };
            return updateOption;
          } else return option;
        }
      });
      return {
        ...question,
        options: updateOptions,
      };
    });
    setQuestions(updateAnswersState);
  }, [correctAnswersNumber, selectedAnswers]);

  React.useEffect(() => {
    let count = 0;

    for (let i = 0; i < selectedAnswers.length; i++) {
      if (selectedAnswers[i] === correctAnswers[i]) {
        count++;
      }
    }
    updateCorrectAnswersNumber(count);
  }, [selectedAnswers, correctAnswers]);

  function renderQuestions() {
    const check = questions.map((question) => {
      const key = question.id;

      function renderQuestion() {
        function changeColor(event, key) {
          if (event.target.tagName === "LABEL") {
            const updatedData = questions.map((question) => {
              if (key === question.id) {
                const updatedBtn = question.options.map((option) => {
                  if (
                    option.option ===
                    event.target.querySelector('input[type="radio"]').value
                  ) {
                    return {
                      ...option,
                      isSelected: !option.isSelected,
                    };
                  } else {
                    return {
                      ...option,
                      isSelected: false,
                    };
                  }
                });
                return {
                  ...question,
                  options: updatedBtn,
                };
              } else return question;
            });
            setQuestions(updatedData);
          }
        }
        return question.options.map((option, index) => {
          function color(option) {
            if (option.correct) {
              return {
                backgroundColor: "#94D7A2",
                border: "none",
              };
            } else if (option.correct === false) {
              return {
                backgroundColor: "#F8BCBC",
                border: "none",
              };
            } else if (option.actualAns) {
              return {
                backgroundColor: "#94D7A2",
                border: "none",
              };
            } else if (option.isSelected) {
              return {
                backgroundColor: "#B1BCEF",
                color: "white",
                border: "none",
              };
            }
          }

          return (
            <label
              key={index}
              className="option-btn"
              data-key={key}
              onClick={() => changeColor(event, key)}
              style={color(option)}
            >
              <input type="radio" name="answer" value={option.option} />
              {option.option}
            </label>
          );
        });
      }
      return (
        <div key={key}>
          <h3>{question.question}</h3>
          <div className="options">{renderQuestion()}</div>
          <div className="stike-through"></div>
        </div>
      );
    });

    function Renderbutton() {
      if (!buttonState) {
        return (
          <button onClick={() => checkAnswers(event)} className="start-btn">
            Check Answers
          </button>
        );
      } else {
        return <button className="start-btn">Play Again</button>;
      }
    }

    function checkAnswers(event) {
      event.preventDefault();

      const userSelectedAnswers = [];

      const correctAnswers = [];

      questions.map((question) => {
        correctAnswers.push(question.correct_answer);
        question.options.map((option) => {
          if (option.isSelected === true) {
            userSelectedAnswers.push(option.option);
          }
        });
      });

      updateSelectedAnswers(userSelectedAnswers);

      setCorrectAnswers(correctAnswers);

      setButtonState(!buttonState);
    }

    return (
      <div className="questions-container">
        <form>
          {check}
          <h3>
            {correctAnswersNumber === 0
              ? "Your score is 0"
              : `You scored ${correctAnswersNumber}/5 questions.`}
          </h3>
          <Renderbutton />
        </form>
      </div>
    );
  }

  return (
    <main className="container">
      <div className="magicpattern-one"></div>
      {gameState ? (
        <div className="main-questions-area"> {renderQuestions()} </div>
      ) : (
        startingCode()
      )}
      <div className="magicpattern-two"></div>
    </main>
  );
}
