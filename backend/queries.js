const { gql } = require('graphql-request')

const GET_CLASSES_QUERY = gql`
    query GetClasses($pageIndex: Int!, $itemsPerPage: Int!, $orderBy: String, $teacherId: String, $search: String) {
        classes(payload: { pageIndex: $pageIndex, itemsPerPage: $itemsPerPage, orderBy: $orderBy, teacher_equals: $teacherId, filter_textSearch: $search }) {
            data {
                id
                name
                level
                course {
                    id
                    name
                    shortName
                    __typename
                }
                classSites {
                    _id
                    name
                    __typename
                }
                startDate
                endDate
                status
                centre {
                    id
                    name
                    shortName
                    __typename
                }
                openingRoomNo
                numberOfSessions
                numberOfSessionsStatus
                sessionHour
                totalHour
                slots {
                    _id
                    date
                    startTime
                    endTime
                    sessionHour
                    summary
                    homework
                    teachers {
                        _id
                        teacher {
                            id
                            username
                            code
                            fullName
                            email
                            phoneNumber
                            user
                            imageUrl
                            __typename
                        }
                        role {
                            id
                            name
                            shortName
                            __typename
                        }
                        isActive
                        __typename
                    }
                    teacherAttendance {
                        _id
                        teacher {
                            id
                            username
                            code
                            fullName
                            email
                            phoneNumber
                            user
                            imageUrl
                            __typename
                        }
                        status
                        note
                        createdBy
                        createdAt
                        lastModifiedBy
                        lastModifiedAt
                        __typename
                    }
                    studentAttendance {
                        _id
                        student {
                            id
                            fullName
                            phoneNumber
                            email
                            gender
                            imageUrl
                            __typename
                        }
                        status
                        comment
                        sendCommentStatus
                        __typename
                    }
                    __typename
                }
                students {
                    _id
                    student {
                        id
                        customer {
                            fullName
                            phoneNumber
                            email
                            facebook
                            zalo
                            __typename
                        }
                        __typename
                    }
                    note
                    activeInClass
                    createdBy
                    createdAt
                    __typename
                }
                teachers {
                    _id
                    teacher {
                        id
                        username
                        code
                        fullName
                        email
                        phoneNumber
                        user
                        imageUrl
                        __typename
                    }
                    role {
                        id
                        name
                        shortName
                        __typename
                    }
                    isActive
                    __typename
                }
                operator {
                    id
                    username
                    firstName
                    middleName
                    lastName
                    __typename
                }
                operationMethod {
                    id
                    name
                    __typename
                }
                classOpeningPlanId
                hasSchedule
                createdBy
                createdAt
                lastModifiedBy
                lastModifiedAt
                __typename
            }
            pagination {
                type
                total
                __typename
            }
            __typename
        }
    }
`

const GET_TIMESHEET_QUERY = gql`
    query findTimesheetByTeacher($teacherId: String, $startDate: String, $endDate: String, $type: String, $classId: String, $status: String, $classSessionStatusNotIn: [String]) {
        findTimesheetByTeacher(
            payload: { teacherId: $teacherId, startDate: $startDate, endDate: $endDate, type: $type, classId: $classId, status: $status, classSessionStatusNotIn: $classSessionStatusNotIn }
        ) {
            type
            centre {
                name
                __typename
            }
            id
            date
            officeHour {
                status
                startTime
                studentCount
                endTime
                type
                courses {
                    id
                    shortName
                    __typename
                }
                __typename
            }
            classSessionAttendance {
                id
                startTime
                endTime
                sessionHour
                status
                class {
                    id
                    name
                    __typename
                }
                __typename
            }
            status
            __typename
        }
    }
`

module.exports = {
    GET_CLASSES_QUERY,
    GET_TIMESHEET_QUERY,
}
