const url_root = '../json';
let current_course;

export async function renderWithTemplate(
    templateFn,
    parentElement,
    data,
    callback,
    position = "afterbegin",
    clear = true
  ) {
    if (clear) {
      parentElement.innerHTML = "";
    }
    const htmlString = await templateFn(data);
    parentElement.insertAdjacentHTML(position, htmlString);
    if (callback) {
      callback(data);
    }
  }

function loadTemplate(path) {
    return async function () {
      const res = await fetch(path);
      if (res.ok) {
        const html = await res.text();
        return html;
      }
    };
}

export async function loadHeader() {
    const headerTemplateFn = loadTemplate("/partials/header.html");
    const headerEl = document.querySelector("#main-header");
    renderWithTemplate(headerTemplateFn, headerEl);
  }

async function loadAccountInfo() {
  const file_url = `${url_root}/student.json`;
  const st_id = '20240001';

  try {
      const response = await fetch(file_url);
      const data = await response.json();
      const students = data.students;

      // Assuming st_id is defined elsewhere
      const student = students.find(student => student.student_id === st_id);

      if (student) {
          const acc_name = document.querySelector("#acc_name");
          const acc_id = document.querySelector("#acc_id");
          const acc_major = document.querySelector("#acc_major");
          const acc_minor = document.querySelector("#acc_minor");
          const acc_gpa = document.querySelector("#acc_gpa");
          const acc_dpt = document.querySelector("#acc_dpt");
          const acc_fac_mentor = document.querySelector("#acc_fac_mentor");

          acc_name.innerHTML = `<strong>Name:</strong> ${student.name}`;
          acc_id.innerHTML = `<strong>Student ID:</strong> ${student.student_id}`;
          acc_major.innerHTML = `<strong>Major:</strong> ${student.major}`;
          acc_minor.innerHTML = `<strong>Minor:</strong> ${student.minor || 'N/A'}`;
          acc_gpa.innerHTML = `<strong>GPA:</strong> ${student.GPA}`;
          acc_dpt.innerHTML = `<strong>Department:</strong> ${student.department}`;
          acc_fac_mentor.innerHTML = `<strong>Faculty Mentor:</strong> ${student.faculty_mentor}`;
      } else {
          console.log(`Student with ID ${st_id} not found.`);
      }
  } catch (error) {
      console.error('Error loading student account information:', error);
  }
}

export async function loadAccountTemplate() {
  try {
      const accountTemplateFn = loadTemplate("/partials/account_info.html");
      const accountDiv = document.querySelector("#main-page");
      await renderWithTemplate(accountTemplateFn, accountDiv);

      loadAccountInfo();
  } catch (error) {
      console.error('Error loading account template:', error);
  }
}

async function loadCourseCards() {
  const file_url = `${url_root}/data.json`;

  try {
      const response = await fetch(file_url);
      const data = await response.json();
      const courses = data.courses;
      const crs_container = document.querySelector("#course-container");

      courses.forEach(course => {
          const crs_card = document.createElement('a');
          const crs_label = document.createElement('p');
          const crs_name = document.createElement('h3');
          const crs_code = document.createElement('h5');
          const crs_img = document.createElement('img');

          crs_card.setAttribute('class', 'course-card');

          crs_name.innerHTML = `<strong> ${course.name}</strong>`;
          crs_code.textContent = `${course.code}`;
          crs_img.setAttribute('src', `images/${course.image}`);
          crs_img.setAttribute('alt', `${course.name} bg-image`);

          crs_label.append(crs_name, crs_code);
          crs_card.append(crs_img, crs_label);
          crs_container.appendChild(crs_card);

          crs_card.addEventListener('click', () => {
              current_course = course.name;
              crs_container.style.display = 'none'; // Hide course cards
              loadCourseQuiz(); // Load quizzes for the selected course
          });
      });

  } catch (error) {
      console.error('Error loading the course information:', error);
  }
}

export async function loadCourseTemplate() {
  try {
      const accountTemplateFn = loadTemplate("/partials/course_info.html");
      const courseDiv = document.querySelector("#main-page");
      await renderWithTemplate(accountTemplateFn, courseDiv);

      loadCourseCards();
  } catch (error) {
      console.error('Error loading account template:', error);
  }
}

async function loadCourseQuiz() {
  const file_url = `${url_root}/data.json`;

  try {
      const response = await fetch(file_url);
      const data = await response.json();
      const courses = data.courses;
      const quiz_page = document.querySelector(".quiz-page");

      const selectedCourse = courses.find(course => course.name === current_course);
      if (selectedCourse) {
          const assignments = selectedCourse.assignments;
          const quizzesByMonth = groupQuizzesByMonth(assignments);

          const pageTitle = document.querySelector(".main-h1");
          pageTitle.textContent = `${current_course} Quizzes`;

          for (const month in quizzesByMonth) {
              const quizzes = quizzesByMonth[month];
              const monthContainer = document.createElement('div');
              monthContainer.classList.add('quiz-month-container');

              const monthTitle = document.createElement('h3');
              monthTitle.textContent = month;

              monthContainer.appendChild(monthTitle);

              quizzes.forEach(assignment => {
                  // const quizCard = createQuizCard(assignment);
                  const quizCard = assignment.score !== "" ? updateQuizCard(assignment) : createQuizCard(assignment);
                  monthContainer.appendChild(quizCard);
              });

              quiz_page.appendChild(monthContainer);
          }
      }
  } catch (error) {
      console.error('Error loading the course quizzes:', error);
  }
}

function groupQuizzesByMonth(assignments) {
  const quizzesByMonth = {};

  assignments.forEach(assignment => {
      const deadlineDate = new Date(assignment.deadline);
      const monthYear = deadlineDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      if (!quizzesByMonth[monthYear]) {
          quizzesByMonth[monthYear] = [];
      }

      quizzesByMonth[monthYear].push(assignment);
  });

  return quizzesByMonth;
}

function createQuizCard(quiz) {
  const quizCard = document.createElement('div');
  quizCard.classList.add('quiz-card');

  const quizName = document.createElement('h4');
  quizName.textContent = quiz.name;

  const deadline = document.createElement('p');
  deadline.textContent = `Deadline: ${quiz.deadline}`;

  const timeLimit = document.createElement('p');
  timeLimit.textContent = `Time Limit: ${quiz.time_limit}`;

  const start_btn = document.createElement('button');
  start_btn.textContent = 'Start Quiz';
  start_btn.setAttribute('name', 'start_btn');
  start_btn.setAttribute('class', 'start_btn');

  start_btn.addEventListener('click', () => {
    startQuiz(quiz);
  });

  quizCard.appendChild(quizName);
  quizCard.appendChild(deadline);
  quizCard.appendChild(timeLimit);
  quizCard.appendChild(start_btn);

  return quizCard;
}

function updateQuizCard(quiz) {
  const quizCard = document.createElement('div');
  quizCard.classList.add('quiz-card');

  const quizName = document.createElement('h4');
  quizName.textContent = quiz.name;

  const deadline = document.createElement('p');
  deadline.textContent = `Deadline: ${quiz.deadline}`;

  const timeLimit = document.createElement('p');
  timeLimit.textContent = `Time Limit: ${quiz.time_limit}`;

  const scoreDisplay = document.createElement('p');
  scoreDisplay.textContent = `Score: ${quiz.score}/${quiz.total_points}`;

  quizCard.appendChild(quizName);
  quizCard.appendChild(deadline);
  quizCard.appendChild(timeLimit);
  quizCard.appendChild(scoreDisplay);

  return quizCard;
}


function startQuiz(quiz) {
  // Hide the quiz card container
  const quizCardContainer = document.querySelector('.quiz-page');
  quizCardContainer.style.display = 'none';
  quizCardContainer.innerHTML = '';

  // Create the quiz page container
  const quizPageContainer = document.querySelector('.quiz-page-container');

  // Create elements to display quiz information
  const quizHeader = document.createElement('div');
  quizHeader.classList.add('quiz-header');
  quizHeader.classList.add('divider');
  
  const quizTitle = document.createElement('h2');
  quizTitle.textContent = quiz.name;

  const deadline = document.createElement('p');
  deadline.textContent = `Deadline: ${quiz.deadline}`;

  const timeLimit = document.createElement('p');
  timeLimit.textContent = `Time Limit: ${quiz.time_limit}`;

  // Append quiz information to the quiz page container
  quizHeader.append(quizTitle, deadline, timeLimit);
  quizPageContainer.appendChild(quizHeader);
  
  let iterator = 1;

  // Iterate over the questions in the quiz
  quiz.questions.forEach((question, index) => {
      // Create elements for each question
      const questionContainer = document.createElement('div');
      questionContainer.classList.add('question-container');

      const questionTitle = document.createElement('h3');
      questionTitle.textContent = `Question ${index + 1}: ${question.content}`;
      questionContainer.appendChild(questionTitle);

      // Iterate over the answer options for the question
      question.answer_options.forEach(option => {
          const optionContainer = document.createElement('p');
          optionContainer.classList.add('option-container');

          const optionItem = document.createElement('input');
          const optionLabel = document.createElement('label');
          optionLabel.textContent = option;
          optionItem.type = 'radio';
          optionItem.name = `question${iterator}_answers`;
          optionItem.value = option;
          optionContainer.appendChild(optionItem);
          optionContainer.appendChild(optionLabel);
          questionContainer.appendChild(optionContainer);
      });

      iterator += 1;
      
      // Append question container to the quiz page container
      quizPageContainer.appendChild(questionContainer);
      
  });

  const btn_container = document.createElement('p');
  btn_container.classList.add('btn-container');

  const submit_btn = document.createElement('button');
  submit_btn.classList.add('submit-btn');
  submit_btn.textContent = "Submit Quiz";

  submit_btn.addEventListener('click', () => {
    const score = calculateScore(quiz);
    updateScoreInJSON(quiz, score);
    // Show the quiz card container again after submitting the quiz
    quizCardContainer.style.display = 'block';
    // Clear the quiz page container
    quizPageContainer.innerHTML = '';
  });

  btn_container.appendChild(submit_btn);
  quizPageContainer.appendChild(btn_container);

}


function calculateScore(quiz) {
  let score = 0;

  // Iterate over the questions in the quiz
  quiz.questions.forEach(question => {
      // Find the selected answer for the question
      const selectedOption = document.querySelector(`input[name="${question.content}"]:checked`);

      // If an answer is selected and it matches the correct answer, increment the score
      if (selectedOption && selectedOption.value === question.correct_answer) {
          score += 4;
      }
  });

  return score;
}

function displayScore(score, container) {
  // Create an element to display the score
  const scoreElement = document.createElement('p');
  scoreElement.textContent = `Score: ${score}`;

  // Append the score element to the container
  container.appendChild(scoreElement);
}

async function updateScoreInJSON(quiz, score) {
  const file_url = `${url_root}/data.json`;

  try {
    const response = await fetch(file_url);
    const data = await response.json();
    const courses = data.courses;

    // Find the course and quiz in the JSON data
    const courseIndex = courses.findIndex(course => course.name === current_course);
    if (courseIndex !== -1) {
      const assignmentIndex = courses[courseIndex].assignments.findIndex(assignment => assignment.name === quiz.name);
      if (assignmentIndex !== -1) {
        // Update the score for the quiz
        courses[courseIndex].assignments[assignmentIndex].score = score.toString();

        // Write the updated JSON data back to the file
        const jsonData = JSON.stringify(data, null, 2);
        const updatedResponse = await fetch(file_url, {
          method: 'PUT',
          body: jsonData,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (updatedResponse.ok) {
          console.log('Score updated successfully in the JSON file.');
          // Reload the course quizzes with the updated score
          loadCourseQuiz();
        } else {
          console.error('Failed to update score in the JSON file.');
        }
      } else {
        console.error('Assignment not found in the JSON data.');
      }
    } else {
      console.error('Course not found in the JSON data.');
    }
  } catch (error) {
    console.error('Error updating score in the JSON file:', error);
  }
}

function getCurrentMonth() {
  const currentDate = new Date();
  const monthYear = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  return monthYear;
}

// Function to filter assignments by current month
function filterAssignmentsByCurrentMonth(assignments) {
  const currentMonth = getCurrentMonth();
  const assignmentsForCurrentMonth = assignments.filter(assignment => {
    const deadlineDate = new Date(assignment.deadline);
    const monthYear = deadlineDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return monthYear === currentMonth;
  });
  return assignmentsForCurrentMonth;
}

// Function to display assignments in the dashboard
function displayAssignmentsInDashboard(assignments) {
  const dashboardContainer = document.querySelector('.dashboard-container');
  const stats = document.querySelector('.stats');
  stats.innerHTML = `<strong>${assignments.length}</strong> <br> still remaining`;
  const assignmentsListContainer = document.createElement('div');
  assignmentsListContainer.classList.add('assignments-list-container');

  const currentMonth = getCurrentMonth();
  const heading = document.createElement('h3');
  heading.textContent = `Assignments for ${currentMonth}`;
  assignmentsListContainer.appendChild(heading);

  if (assignments.length === 0) {
    const noAssignmentsMessage = document.createElement('p');
    noAssignmentsMessage.textContent = 'No assignments for this month.';
    assignmentsListContainer.appendChild(noAssignmentsMessage);
  } else {
    assignments.forEach(assignment => {
      const assignmentItem = document.createElement('div');
      assignmentItem.classList.add('assignment-item');

      const assignmentName = document.createElement('p');
      assignmentName.textContent = assignment.name;

      const assignmentDeadline = document.createElement('p');
      assignmentDeadline.textContent = `Deadline: ${assignment.deadline}`;

      assignmentItem.appendChild(assignmentName);
      assignmentItem.appendChild(assignmentDeadline);

      assignmentsListContainer.appendChild(assignmentItem);
    });
  }

  // Clear previous content
  // dashboardContainer.innerHTML = '';

  // Append assignments list to the dashboard container
  dashboardContainer.appendChild(assignmentsListContainer);
}

// Function to load and display assignments in the dashboard
async function loadAssignmentsInDashboard() {
  const file_url = `${url_root}/data.json`;

  try {
    const response = await fetch(file_url);
    const data = await response.json();
    const courses = data.courses;

    // Find assignments for the current month
    const assignmentsForCurrentMonth = [];
    courses.forEach(course => {
      course.assignments.forEach(assignment => {
        assignmentsForCurrentMonth.push(assignment);
      });
    });

    const filteredAssignments = filterAssignmentsByCurrentMonth(assignmentsForCurrentMonth);
    console.log(filteredAssignments)
    displayAssignmentsInDashboard(filteredAssignments);
  } catch (error) {
    console.error('Error loading and displaying assignments:', error);
  }
}

export async function loadAssignments() {
  // header template will still be a function! But one where we have pre-supplied the argument.
  // headerTemplate and footerTemplate will be almost identical, but they will remember the path we passed in when we created them
  // why is it important that they stay functions?  The renderWithTemplate function is expecting a template function...if we sent it a string it would break, if we changed it to expect a string then it would become less flexible.
  const dashboardTemplateFn = loadTemplate("/partials/dashboard.html");
  const dashboardEl = document.querySelector("#main-page");
  renderWithTemplate(dashboardTemplateFn, dashboardEl);
  loadAssignmentsInDashboard();
}

// window.onload = (){
//   const dashboardContainer = document.querySelector('.dashboard-container');
//   dashboardContainer.innerHTML = '';
// }