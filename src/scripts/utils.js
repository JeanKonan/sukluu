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
    // wait what?  we are returning a new function? this is called currying and can be very helpful.
    return async function () {
      const res = await fetch(path);
      if (res.ok) {
        const html = await res.text();
        return html;
      }
    };
}

export async function loadHeaderFooter() {
    // header template will still be a function! But one where we have pre-supplied the argument.
    // headerTemplate and footerTemplate will be almost identical, but they will remember the path we passed in when we created them
    // why is it important that they stay functions?  The renderWithTemplate function is expecting a template function...if we sent it a string it would break, if we changed it to expect a string then it would become less flexible.
    const headerTemplateFn = loadTemplate("/partials/header.html");
    const footerTemplateFn = loadTemplate("/partials/footer.html");
    const headerEl = document.querySelector("#main-header");
    const footerEl = document.querySelector("#main-footer");
    renderWithTemplate(headerTemplateFn, headerEl);
    renderWithTemplate(footerTemplateFn, footerEl);
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
                  const quizCard = createQuizCard(assignment);
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

function startQuiz(quiz) {
  // Hide the quiz card container
  const quizCardContainer = document.querySelector('.quiz-page');
  quizCardContainer.style.display = 'none';

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

  // Iterate over the questions in the quiz
  quiz.questions.forEach((question, index) => {
      // Create elements for each question
      const questionContainer = document.createElement('div');
      questionContainer.classList.add('question-container');

      const questionTitle = document.createElement('h3');
      questionTitle.textContent = `Question ${index + 1}: ${question.content}`;

      const optionsList = document.createElement('ul');

      // Iterate over the answer options for the question
      question.answer_options.forEach(option => {
          const optionItem = document.createElement('li');
          optionItem.textContent = option;
          optionsList.appendChild(optionItem);
      });

      // Append question elements to the question container
      questionContainer.appendChild(questionTitle);
      questionContainer.appendChild(optionsList);

      // Append question container to the quiz page container
      quizPageContainer.appendChild(questionContainer);
  });

}
