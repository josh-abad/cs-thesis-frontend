import usersService from '@/services/users'
import coursesService from '@/services/courses'
import examItemsService from '@/services/exam-items'
import examsService from '@/services/exams'
import examAttemptsService from '@/services/exam-attempts'
import examResultsService from '@/services/exam-results'
import loginService from '@/services/login'
import {
  Attempt,
  Course,
  DialogContent,
  Exam,
  ExamItem,
  ExamResult,
  Role,
  State,
  Theme,
  User,
  UserCredentials
} from '@/types'
import { createStore } from 'vuex'
import * as actionType from './action-types'
import * as mutationType from './mutation-types'

const state: State = {
  user: null,
  users: [],
  courses: [],
  recentCourses: [],
  maxRecentCourses: 3,
  examItems: [],
  exams: [],
  message: '',
  attempts: [],
  examResults: [],
  activeExam: null,
  dialog: {
    header: '',
    message: '',
    actionLabel: '',
    closed: true
  },
  theme: 'dark'
}

const mutations = {
  [mutationType.SET_USER] (state: State, user: User): void {
    state.user = user
  },
  [mutationType.SET_USERS] (state: State, users: Omit<User, 'token'>[]): void {
    state.users = users
  },
  [mutationType.SET_COURSES] (state: State, courses: Course[]): void {
    state.courses = courses
  },
  [mutationType.REMOVE_COURSE] (state: State, courseId: string): void {
    state.courses = state.courses.filter(course => course.id !== courseId)
  },
  [mutationType.SET_RECENT_COURSES] (state: State, recentCourses: string[]): void {
    state.recentCourses = recentCourses
  },
  [mutationType.SET_EXAM_ITEMS] (state: State, examItems: ExamItem[]): void {
    state.examItems = examItems
  },
  [mutationType.SET_EXAMS] (state: State, exams: Exam[]): void {
    state.exams = exams
  },
  [mutationType.SET_ATTEMPTS] (state: State, attempts: Attempt[]): void {
    state.attempts = attempts
  },
  [mutationType.SET_EXAM_RESULTS] (state: State, examResults: ExamResult[]): void {
    state.examResults = examResults
  },
  [mutationType.SET_MESSAGE] (state: State, message: string): void {
    state.message = message
  },
  [mutationType.ADD_ATTEMPT] (state: State, attempt: Attempt): void {
    state.attempts = state.attempts.concat(attempt)
  },
  [mutationType.UPDATE_ATTEMPT] (state: State, newAttempt: Attempt): void {
    state.attempts = state.attempts.map(attempt => attempt.id === newAttempt.id ? newAttempt : attempt)
  },
  [mutationType.ADD_EXAM_RESULT] (state: State, examResult: ExamResult): void {
    state.examResults = state.examResults.concat(examResult)
  },
  [mutationType.SET_ACTIVE_EXAM] (state: State, examId: string): void {
    state.activeExam = examId
  },
  [mutationType.DISPLAY_DIALOG] (state: State, dialogContent: Omit<DialogContent, 'closed'>): void {
    state.dialog.closed = false
    state.dialog.header = dialogContent.header
    state.dialog.actionLabel = dialogContent.actionLabel
    state.dialog.message = dialogContent.message
  },
  [mutationType.CLOSE_DIALOG] (state: State): void {
    state.dialog.closed = true
    state.dialog.header = ''
    state.dialog.actionLabel = ''
    state.dialog.message = ''
  },
  [mutationType.SET_THEME] (state: State, theme: Theme | 'system-dark' | 'system-light'): void {
    // This is so the logo in TheNavBar will react to change in system theme
    if (theme?.includes('system')) {
      state.theme = theme.split('-')[1] as Theme
      state.theme = null
    } else {
      state.theme = theme as Theme
    }

    if (state.theme) {
      localStorage.setItem('theme', state.theme)
    } else {
      localStorage.removeItem('theme')
    }

    const html = document.querySelector('html')
    if (html) {
      if (state.theme === 'dark' || (!state.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  },
  [mutationType.ADD_RECENT_COURSE] (state: State, courseId: string): void {
    // Don't add invalid courses
    if (!state.courses.some(course => course.id === courseId)) {
      return
    }

    if (state.recentCourses.includes(courseId)) {
      state.recentCourses = state.recentCourses.filter(id => id !== courseId)
    }

    if (state.recentCourses.length >= state.maxRecentCourses) {
      state.recentCourses.shift()
    }

    state.recentCourses.push(courseId)
    localStorage.setItem('recentCourses', JSON.stringify(state.recentCourses))
  }
}

const getters = {
  isLoggedIn (state: State): boolean {
    return state.user !== null
  },
  userRole (state: State): Role | undefined {
    return state.user?.role
  },
  getCourseByID (state: State): (id: string) => Course | undefined {
    return (id) => {
      return state.courses.find(course => course.id === id)
    }
  },
  getExamByID (state: State): (id: string) => Exam | undefined {
    return (id) => {
      return state.exams.find(exam => exam.id === id)
    }
  },
  getAttemptByID (state: State): (id: string) => Attempt | undefined {
    return (id) => {
      return state.attempts.find(attempt => attempt.id === id)
    }
  },
  getExamsByCourse (state: State): (courseId: string) => Exam[] | undefined {
    return (courseId) => {
      return state.exams.filter(exam => {
        return exam.course.id === courseId
      })
    }
  },
  getExamItemsByCourse (state: State): (courseId: string) => ExamItem[] | undefined {
    return (courseId) => {
      return state.examItems.filter(examItem => {
        return examItem.course.id === courseId
      })
    }
  },
  getAttemptsByExam (state: State): (examId: string) => Attempt[] | undefined {
    return (examId) => {
      return state.attempts.filter(attempt => {
        return attempt.exam === examId
      })
    }
  },
  getUserCourses (state: State): Course[] {
    return state.courses.filter(course => {
      return state.user?.courses.some(id => course.id === id)
    })
  },
  getRecentCourses (state: State): (Course | undefined)[] {
    const toCourse = (id: string): Course | undefined => {
      return state.courses.find(course => course.id === id)
    }
    const defined = (course: Course | undefined): boolean => {
      return course !== undefined
    }
    return state.recentCourses.map(toCourse).filter(defined).reverse()
  }
}

export default createStore({
  state,
  mutations,
  actions: {
    async [actionType.LOAD_COURSES] ({ commit }): Promise<void> {
      try {
        commit(mutationType.SET_COURSES, await coursesService.getAll())
      } catch (error) {
        console.error(error)
      }
    },
    async [actionType.LOAD_USERS] ({ commit, dispatch }): Promise<void> {
      try {
        commit(mutationType.SET_USERS, await usersService.getAll())
      } catch (error) {
        dispatch(actionType.ALERT, 'Could not load users from server')
      }
    },
    async [actionType.DELETE_COURSE] ({ commit, dispatch }, courseId: string): Promise<void> {
      try {
        await coursesService.deleteCourse(courseId)
        commit(mutationType.REMOVE_COURSE, courseId)
        dispatch(actionType.ALERT, 'Course successfully deleted')
      } catch (error) {
        dispatch(actionType.ALERT, error)
      }
    },
    async [actionType.LOAD_EXAM_ITEMS] ({ commit }): Promise<void> {
      try {
        commit(mutationType.SET_EXAM_ITEMS, await examItemsService.getAll())
      } catch (error) {
        console.error(error)
      }
    },
    async [actionType.LOAD_EXAMS] ({ commit }): Promise<void> {
      try {
        commit(mutationType.SET_EXAMS, await examsService.getAll())
      } catch (error) {
        console.error(error)
      }
    },
    async [actionType.LOAD_EXAM_RESULTS] ({ commit }, userId?: string): Promise<void> {
      try {
        if (userId) {
          commit(mutationType.SET_EXAM_RESULTS, await examResultsService.getByUser(userId))
        } else {
          commit(mutationType.SET_EXAM_RESULTS, await examResultsService.getAll())
        }
      } catch (error) {
        console.error(error)
      }
    },
    async [actionType.LOAD_ATTEMPTS] ({ commit }, userId?: string): Promise<void> {
      try {
        if (userId) {
          commit(mutationType.SET_ATTEMPTS, await examAttemptsService.getByUser(userId))
        } else {
          commit(mutationType.SET_ATTEMPTS, await examAttemptsService.getAll())
        }
      } catch (error) {
        console.error(error)
      }
    },
    async [actionType.SIGN_UP] ({ commit, dispatch }, credentials: UserCredentials): Promise<void> {
      try {
        const newUser = await usersService.create(credentials)
        localStorage.setItem('loggedAppUser', JSON.stringify(newUser))
        commit(mutationType.SET_USER, newUser)
      } catch (error) {
        dispatch(actionType.ALERT, error)
      }
    },
    async [actionType.LOG_IN] ({ commit, dispatch }, { username, password }): Promise<void> {
      try {
        const user = await loginService.login({ username, password })
        commit(mutationType.SET_USER, user)
        localStorage.setItem('loggedAppUser', JSON.stringify(user))
        examAttemptsService.setToken(user.token)
        commit(mutationType.SET_ATTEMPTS, await examAttemptsService.getByUser(user.id))
        commit(mutationType.SET_EXAM_RESULTS, await examResultsService.getByUser(user.id))
      } catch (error) {
        dispatch(actionType.ALERT, 'Incorrect username or password')
      }
    },
    async [actionType.LOG_OUT] ({ commit }): Promise<void> {
      localStorage.clear()
      commit(mutationType.SET_USER, null)
    },
    async [actionType.START_ATTEMPT] ({ commit, dispatch }, examId): Promise<void> {
      try {
        const response = await examAttemptsService.start(examId)
        commit(mutationType.ADD_ATTEMPT, response.attempt)
        localStorage.setItem('activeExam', JSON.stringify(response))
        examResultsService.setToken(response.token)
        commit(mutationType.SET_ACTIVE_EXAM, response.attempt.exam)
      } catch (error) {
        dispatch(actionType.ALERT, 'Attempt could not be started')
      }
    },
    async [actionType.ALERT] ({ commit }, message) {
      commit(mutationType.SET_MESSAGE, message)
      setTimeout(() => {
        commit(mutationType.SET_MESSAGE, '')
      }, 5000)
    },
    async [actionType.SUBMIT_EXAM] ({ commit }, payload) {
      const response = await examResultsService.submit(payload)
      commit(mutationType.ADD_EXAM_RESULT, response.examResult)
      commit(mutationType.UPDATE_ATTEMPT, response.attempt)
    }
  },
  modules: {
  },
  getters
})
