# StudyFlow Backend Data Flow

هذا الملف يشرح كيف تم بناء الباك اند في المشروع، وكيف تتحرك البيانات من الفرونت إلى Laravel ثم إلى قاعدة البيانات، وما هي أهم الجداول والأعمدة، ومن أين تأتي قيمة كل عمود.

## 1. المعمارية العامة

- الفرونت اند: `Next.js`
- الباك اند: `Laravel`
- قاعدة البيانات: `MySQL / MariaDB`
- التوثيق هذا مبني على:
  - `studyflow-backend/routes/api.php`
  - `studyflow-backend/app/Http/Controllers/Api/*`
  - `studyflow-backend/database/migrations/*`

الفكرة العامة:

1. المستخدم يعمل حدث في الواجهة.
2. الفرونت يرسل request إلى endpoint في Laravel.
3. الكنترولر يعمل validation وnormalization.
4. Laravel يحفظ البيانات في الجدول المناسب.
5. أحيانًا يتم إنشاء `notification` مرتبطة بالحدث.
6. Laravel يرجع response والفرونت يحدث الواجهة.

## 2. تدفق البيانات العام

الصيغة العامة في أغلب الموديولات:

1. `UI Form / Action`
2. `src/services/*.ts`
3. `apiClient -> /api/...`
4. `Laravel Route`
5. `Controller`
6. `Model`
7. `Database Table`
8. `Response Mapper`
9. `Frontend Store / UI`

مثال سريع:

- المستخدم يضيف كورس
- الفرونت يرسل `POST /api/courses`
- `CourseController@store`
- Laravel يحفظ في `courses`
- ينشئ أسابيع تلقائيًا في `weekly_plans`
- ينشئ إشعار في `notifications`
- يرجع الكورس للفرونت

## 3. الـ API Modules

الموديولات الرئيسية في الباك:

- Authentication
- User Profile / Settings
- Semesters
- Courses
- Weekly Plans
- Tasks
- Exam Prep
- Self Learning
- Resources
- Reflections
- Focus Sessions
- Notifications
- Dashboard summaries

## 4. الجداول الأساسية في قاعدة البيانات

مهم: يوجد جداول Laravel system مثل:

- `cache`
- `cache_locks`
- `jobs`
- `job_batches`
- `failed_jobs`
- `personal_access_tokens`
- `password_resets`

هذه جداول نظام/أمن/توكنات، وليست جوهر business data للتطبيق.

التركيز الحقيقي للمشروع على الجداول التالية:

### 4.1 `users`

الغرض:
- تخزين بيانات الحساب
- بيانات الـ onboarding
- إعدادات المستخدم

أهم الأعمدة:

| العمود | النوع | المصدر من الفرونت | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم المستخدم |
| `name` | string | Register / Settings | اسم المستخدم |
| `email` | string | Register / Login | البريد الإلكتروني |
| `password` | string | Register / Reset Password | كلمة المرور بعد التشفير |
| `avatar_url` | longText nullable | Settings profile image | رابط صورة المستخدم |
| `academic_year` | string nullable | Setup / Settings | السنة الدراسية |
| `total_credit_hours` | integer | Setup / Settings | إجمالي الساعات المطلوبة |
| `completed_credit_hours` | integer | Setup / Settings | الساعات المنجزة مسبقًا |
| `current_gpa` | float | Setup / Settings | المعدل الحالي |
| `university` | string nullable | Setup / Settings | اسم الجامعة |
| `major` | string nullable | Setup / Settings | التخصص |
| `current_semester` | integer | Settings | السمستر الحالي |
| `onboarding_completed` | boolean | Setup flow | هل المستخدم أنهى الإعداد الأولي |
| `reminder_preferences` | json nullable | Settings | إعدادات التذكير |
| `focus_preferences` | json nullable | Settings | إعدادات التركيز |
| `theme_preference` | string | Settings | `light/dark/system` |
| `remember_token` | string nullable | Laravel auth | تذكّر تسجيل الدخول |
| `email_verified_at` | timestamp nullable | Email verification | تاريخ توثيق البريد |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | تلقائي | تاريخ آخر تعديل |

أين يتم تعبئتها؟

- التسجيل: `POST /register`
- تحديث البروفايل والإعدادات: `POST /user/update-profile`
- جلب البروفايل: `GET /user`

### 4.2 `semesters`

الغرض:
- تمثيل الفصول الدراسية في صفحة `academic-planning`

أهم الأعمدة:

| العمود | النوع | المصدر من الفرونت | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم السمستر |
| `user_id` | foreignId | من التوكن الحالي | صاحب السمستر |
| `name` | string | Add/Edit Semester | اسم السمستر |
| `academic_year` | string | Add/Edit Semester | السنة الأكاديمية |
| `num_of_weeks` | integer | Add/Edit Semester | عدد الأسابيع |
| `status` | string | Add/Edit Semester | `planned/current/completed` |
| `start_date` | date nullable | Add/Edit Semester | بداية السمستر |
| `end_date` | date nullable | Add/Edit Semester | نهاية السمستر |
| `notes` | text nullable | Add/Edit Semester | ملاحظات إضافية |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | تلقائي | آخر تعديل |

الـ endpoints:

- `GET /semesters`
- `POST /semesters`
- `PUT /semesters/{id}`
- `DELETE /semesters/{id}`

ملاحظات flow:

- عند إنشاء/تعديل/حذف سمستر يتم إنشاء إشعار في `notifications`.
- `SemesterController@index` يحمل السمسترات مع `courses`.

### 4.3 `courses`

الغرض:
- تخزين الكورسات الأكاديمية العادية وprior courses

أهم الأعمدة:

| العمود | النوع | المصدر من الفرونت | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم الكورس |
| `user_id` | foreignId | من المستخدم الحالي | صاحب الكورس |
| `semester_id` | foreignId nullable | Add/Edit Course | السمستر المرتبط |
| `title` | string | Add/Edit Course | اسم الكورس |
| `code` | string nullable | Add/Edit Course | كود الكورس |
| `instructor` | string nullable | Add/Edit Course | اسم المدرس |
| `credits` | integer | Add/Edit Course | عدد الساعات |
| `duration_weeks` | integer | Add/Edit Course | مدة الكورس بالأسابيع |
| `description` | text nullable | Add/Edit Course | وصف الكورس |
| `image_url` | longText nullable | Add/Edit Course | صورة الكورس |
| `numeric_grade` | float nullable | Add/Edit Course | العلامة الرقمية |
| `academic_period` | string nullable | Prior course / course history | الفصل التاريخي مثل `Fall 2024` |
| `final_grade` | string nullable | Prior course / course history | التقدير النهائي |
| `is_prior_completed` | boolean | Prior Course flow | هل هذا كورس سابق منجز |
| `status` | string | Add/Edit Course | `planned/current/completed` |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | تلقائي | آخر تعديل |

مصدر البيانات من الفرونت:

- dialog إضافة كورس
- dialog تعديل كورس
- prior courses section
- details page `/courses/[id]`

الـ endpoints:

- `GET /courses`
- `POST /courses`
- `GET /courses/{id}`
- `PUT /courses/{id}`
- `DELETE /courses/{id}`

ملاحظات مهمة جدًا:

- عند إنشاء كورس جديد، `CourseController@store` ينشئ صفًا في `courses`.
- ثم ينشئ تلقائيًا أسابيع في `weekly_plans` بعدد `duration_weeks`.
- تفاصيل الكورس الإضافية مثل:
  - `assignments`
  - `exams`
  - `academicEvents`
  - `weeklyPlan.studyTasks`
  - `weeklyPlan.assignments`
  - `weeklyPlan.exams`
  يتم حفظ جزء كبير منها حاليًا داخل JSON في `weekly_plans` أو داخل payload تحديث الكورس.

### 4.4 `weekly_plans`

الغرض:
- تمثيل أسابيع الكورس
- تخزين محتوى الأسبوع والمهام والامتحانات التابعة له

أهم الأعمدة:

| العمود | النوع | المصدر من الفرونت | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم الأسبوع |
| `course_id` | foreignId | ينشأ من الكورس | الكورس التابع له |
| `week_number` | integer | auto + edit course details | رقم الأسبوع |
| `title` | string nullable | Course details | عنوان الأسبوع |
| `completed` | boolean | Mark Week Done | هل الأسبوع مكتمل |
| `study_tasks` | json nullable | Weekly timeline | مهام الدراسة للأسبوع |
| `assignments` | json nullable | Weekly timeline | واجبات الأسبوع |
| `exams` | json nullable | Weekly timeline | امتحانات الأسبوع |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | تلقائي | آخر تعديل |

مهم جدًا:

- الجداول القديمة `study_tasks` و`assignments` موجودة تاريخيًا.
- لكن الاعتماد الحالي في التطبيق الفعلي صار على JSON columns داخل `weekly_plans`.
- هذا واضح من:
  - `CourseController::syncWeeklyPlans`
  - `WeeklyPlanController@update`

الـ endpoint المباشر:

- `PUT /weekly-plans/{id}`

الحدث:

- لما المستخدم يعمل `Mark Week Done`
- الفرونت يرسل `completed=true/false`
- Laravel يحدث العمود `completed`
- إذا صار `true` ينشئ إشعار نجاح

### 4.5 `tasks`

الغرض:
- المهام العامة في صفحة `/tasks`
- بعض المهام المرتبطة بالكورس

أهم الأعمدة:

| العمود | النوع | المصدر من الفرونت | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم المهمة |
| `user_id` | foreignId | من المستخدم الحالي | صاحب المهمة |
| `course_id` | foreignId nullable | Task form | كورس مرتبط إن وجد |
| `week_number` | integer nullable | Task form / linked week | رقم الأسبوع المرتبط |
| `title` | string | Task form | عنوان المهمة |
| `description` | text nullable | Task form | وصف المهمة |
| `type` | string | Task form | نوع المهمة |
| `priority` | string | Task form | أولوية المهمة |
| `status` | string | Task form / edit task | حالة المهمة |
| `due_date` | date nullable | Task form | تاريخ الاستحقاق |
| `due_time` | time nullable | Task form | وقت الاستحقاق |
| `reminder` | boolean | Task form | هل التذكير مفعل |
| `reminder_value` | integer | Task form | قيمة التذكير |
| `reminder_unit` | string | Task form | وحدة التذكير `minutes/hours/days` |
| `is_recurring` | boolean | Task form | هل المهمة متكررة |
| `repeat_frequency` | string nullable | Task form | `daily/weekly/monthly` |
| `repeat_interval` | integer | Task form | كل كم مرة تتكرر |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | تلقائي | آخر تعديل |

الـ endpoints:

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/{id}`
- `PATCH /tasks/{id}`
- `DELETE /tasks/{id}`

كيف يأتي كل عمود؟

- `title`, `description`, `type`, `priority`, `status`: من task modal
- `course_id`: من `linkedCourseId`
- `week_number`: من `linkedWeekLabel` أو `weekNumber`
- `due_date`, `due_time`: من `dueDate`, `dueTime`
- `reminder*`: من `reminderConfig`
- `repeat_*`: من `recurrence`

### 4.6 `learning_plans`

الغرض:
- تخزين خطط self-learning

أهم الأعمدة:

| العمود | النوع | المصدر من الفرونت | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم الخطة |
| `user_id` | foreignId | من المستخدم الحالي | صاحب الخطة |
| `title` | string | Add/Edit Learning Plan | اسم الخطة |
| `goal` | text | Add/Edit Learning Plan | الهدف |
| `description` | text nullable | Add/Edit Learning Plan | وصف الخطة |
| `category` | string nullable | Add/Edit Learning Plan | التصنيف |
| `target_skill` | string nullable | Add/Edit Learning Plan | المهارة المستهدفة |
| `start_date` | date | Add/Edit Learning Plan | البداية |
| `end_date` | date nullable | Add/Edit Learning Plan | النهاية |
| `status` | string | Add/Edit Learning Plan | `planned/active/completed/paused` |
| `stages` | json nullable | Learning Plan details | المراحل |
| `milestones` | json nullable | Learning Plan details | الـ milestones |
| `resources` | json nullable | تاريخيًا/احتياطيًا | موارد JSON داخل الخطة |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | آخر تعديل | آخر تعديل |

الـ endpoints:

- `GET /self-learning`
- `POST /self-learning`
- `GET /self-learning/{id}`
- `PUT/PATCH /self-learning/{id}`
- `DELETE /self-learning/{id}`
- `POST /self-learning/{id}/stages`
- `PUT /self-learning/{id}/stages/{stageId}`
- `DELETE /self-learning/{id}/stages/{stageId}`
- `POST /self-learning/{id}/milestones`
- `PUT /self-learning/{id}/milestones/{milestoneId}`
- `DELETE /self-learning/{id}/milestones/{milestoneId}`

مهم:

- `stages` و`milestones` تحفظ كـ JSON arrays داخل نفس صف الخطة.
- كل stage يحتوي داخله tasks/resources/goals/order/status...
- كل milestone يحتوي `targetDate`, `completed`, `notes`, `reminderConfig`.

### 4.7 `resources`

الغرض:
- تخزين الموارد المرتبطة بـ:
  - Course
  - LearningPlan
  - WeekItem

أهم الأعمدة:

| العمود | النوع | المصدر من الفرونت | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم المورد |
| `resourceable_id` | string | Add Resource | رقم/معرف العنصر الأب |
| `resourceable_type` | string | Add Resource | نوع الأب: `Course`, `LearningPlan`, `WeekItem` |
| `title` | string | Add Resource | عنوان المورد |
| `type` | string | Add Resource | نوع المورد: `link/pdf/video/...` |
| `url` | text | Add Resource | رابط/مسار المورد |
| `description` | text nullable | Add Resource | وصف المورد |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | تلقائي | آخر تعديل |

الـ endpoints:

- `GET /resources?resourceable_id=...&resourceable_type=...`
- `POST /resources`
- `PUT /resources/{id}`
- `DELETE /resources/{id}`

مهم:

- تم تعديل `resourceable_id` إلى `string` حتى يدعم `WeekItem UUID`.

### 4.8 `exam_topics`

الغرض:
- تخزين موضوعات التحضير للامتحان

أهم الأعمدة:

| العمود | النوع | المصدر من الفرونت | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم topic |
| `task_id` | unsignedBigInteger nullable | مسار قديم | ارتباط قديم مع task |
| `week_item_id` | string nullable | Exam Prep UI | معرف week item |
| `title` | string | Add Exam Topic | اسم الموضوع |
| `completed` | boolean | Toggle topic | هل تم إنجازه |
| `priority` | string | Topic editor | الأولوية |
| `notes` | text nullable | Topic editor | ملاحظات |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | تلقائي | آخر تعديل |

الـ endpoints:

- `GET /exam-prep/{weekItemId}`
- `POST /exam-prep/{weekItemId}/topics`
- `PATCH /exam-prep/{weekItemId}/topics/{topicId}`
- `DELETE /exam-prep/{weekItemId}/topics/{topicId}`

### 4.9 `focus_sessions`

الغرض:
- تخزين جلسات التركيز / pomodoro

أهم الأعمدة:

| العمود | النوع | المصدر من الفرونت | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم الجلسة |
| `user_id` | foreignId | من المستخدم الحالي | صاحب الجلسة |
| `task_id` | foreignId nullable | قديم/اختياري | مهمة مرتبطة رقمية |
| `minutes` | integer | Focus timer | مدة الجلسة |
| `type` | string | Focus timer | نوع الجلسة |
| `mode` | string nullable | Focus timer | `pomodoro/stopwatch/rest/...` |
| `linked_task_id` | string nullable | Focus timer | task id من الواجهة |
| `linked_course_id` | string nullable | Focus timer | course id من الواجهة |
| `start_time` | timestamp nullable | Focus timer | بداية الجلسة |
| `end_time` | timestamp nullable | Focus timer | نهاية الجلسة |
| `completed` | boolean | Focus timer | هل انتهت الجلسة |
| `notes` | text nullable | Focus timer | ملاحظات |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | تلقائي | آخر تعديل |

الـ endpoints:

- `GET /focus/sessions`
- `POST /focus/sessions`
- `DELETE /focus/sessions/{id}`
- `GET /focus/analytics`
- `GET /focus-sessions/stats`

### 4.10 `reflections`

الغرض:
- تخزين entries صفحة reflections

أهم الأعمدة:

| العمود | النوع | المصدر من الفرونت | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم الـ reflection |
| `user_id` | foreignId | من المستخدم الحالي | صاحب الـ entry |
| `title` | string | Reflection form | عنوان المدخلة |
| `date` | date | Reflection form | تاريخ المدخلة |
| `mood` | string | Reflection form | المزاج |
| `achievements` | text nullable | Reflection form | ماذا أنجز المستخدم |
| `difficulties` | text nullable | Reflection form | الصعوبات |
| `learnings` | text nullable | Reflection form | ماذا تعلم |
| `improvements` | text nullable | Reflection form | ما الذي سيحسن لاحقًا |
| `gratitude` | text nullable | Reflection form | الامتنان |
| `tags` | json nullable | Reflection form | tags array |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | تلقائي | آخر تعديل |

الـ endpoints:

- `GET /reflections`
- `POST /reflections`
- `GET /reflections/{id}`
- `PUT /reflections/{id}`
- `DELETE /reflections/{id}`

### 4.11 `notifications`

الغرض:
- حفظ الإشعارات اليدوية والآلية

أهم الأعمدة:

| العمود | النوع | المصدر | الوصف |
|---|---|---|---|
| `id` | bigint | تلقائي | رقم الإشعار |
| `user_id` | foreignId | من الحدث الحالي | صاحب الإشعار |
| `title` | string | Controller event | عنوان الإشعار |
| `message` | text | Controller event | الرسالة |
| `type` | string | Controller event | `info/success/warning/error/system/critical` |
| `source_key` | string nullable | Notification sync | مفتاح منع التكرار |
| `target_route` | string nullable | Controller event | الصفحة التي يفتحها الإشعار |
| `read_at` | timestamp nullable | Notification actions | تاريخ القراءة |
| `event_date` | timestamp nullable | deadline-based notifications | وقت الحدث نفسه |
| `created_at` | timestamp | تلقائي | تاريخ الإنشاء |
| `updated_at` | timestamp | تلقائي | آخر تعديل |

الـ endpoints:

- `GET /notifications`
- `POST /notifications/sync`
- `PATCH /notifications/{id}/read`
- `POST /notifications/mark-all-read`
- `POST /notifications/clear-all`
- `DELETE /notifications/{id}`

مهم:

- `GET /notifications` الآن قراءة فقط.
- `POST /notifications/sync` يولد إشعارات المواعيد والاقتراب من الديدلاين.

## 5. Catalog للأحداث في الموقع

هذا أهم جزء للشرح للعميل: ماذا يحدث عندما يقع event في الواجهة؟

### 5.1 حدث: تسجيل مستخدم جديد

الفرونت:
- صفحة التسجيل ترسل `POST /register`

Laravel:
- `AuthController@register`

الحفظ في DB:
- جدول `users`
  - `name`
  - `email`
  - `password`
  - `focus_preferences`
  - `reminder_preferences`
  - `theme_preference`

أحداث إضافية:
- يتم إنشاء welcome notification في `notifications`
  - `title = Welcome to StudyFlow!`
  - `target_route = /dashboard`
- يتم إنشاء token في `personal_access_tokens`

### 5.2 حدث: إكمال إعداد الحساب الأولي Setup

الفرونت:
- `POST /user/update-profile`

Laravel:
- `AuthController@updateProfile`

الحفظ في `users`:
- `academic_year`
- `total_credit_hours`
- `completed_credit_hours`
- `current_gpa`
- `university`
- `major`
- `onboarding_completed`

### 5.3 حدث: تسجيل الدخول

الفرونت:
- `POST /login`

Laravel:
- `AuthController@login`

النتيجة:
- لا يضيف صفًا جديدًا في `users`
- ينشئ token في `personal_access_tokens`
- يرجع user + token للفرونت

### 5.4 حدث: إضافة سمستر

الفرونت:
- `POST /semesters`

الحفظ:
- جدول `semesters`
  - `user_id`
  - `name`
  - `academic_year`
  - `num_of_weeks`
  - `status`
  - `start_date`
  - `end_date`
  - `notes`

حدث إضافي:
- إضافة إشعار في `notifications`

### 5.5 حدث: إضافة كورس

الفرونت:
- `POST /courses`

الحفظ:
- جدول `courses`
  - `semester_id`
  - `title`
  - `code`
  - `instructor`
  - `credits`
  - `duration_weeks`
  - `description`
  - `image_url`
  - `numeric_grade`
  - `status`
  - `academic_period`
  - `final_grade`
  - `is_prior_completed`

حدث إضافي:

1. Laravel ينشئ أسابيع تلقائيًا في `weekly_plans`
2. إذا جاء `weeklyPlan` من الفرونت، يتم مزامنته داخل JSON columns
3. يتم إنشاء إشعار "New Course Added"

### 5.6 حدث: تعديل كورس

الفرونت:
- `PUT /courses/{id}`

Laravel:
- `CourseController@update`

الحفظ:
- تحديث الأعمدة نفسها في `courses`
- وإذا أرسل الفرونت `weeklyPlan` يتم تحديث:
  - `weekly_plans.title`
  - `weekly_plans.completed`
  - `weekly_plans.study_tasks`
  - `weekly_plans.assignments`
  - `weekly_plans.exams`

### 5.7 حدث: تعليم أسبوع كمكتمل

الفرونت:
- `PUT /weekly-plans/{id}` مع `completed`

Laravel:
- `WeeklyPlanController@update`

الحفظ:
- تحديث `weekly_plans.completed`

حدث إضافي:
- إذا صارت القيمة `true` ينشئ notification نجاح

### 5.8 حدث: إضافة task عامة

الفرونت:
- `POST /tasks`

Laravel:
- `TaskController@store`

الحفظ:
- `tasks.title`
- `tasks.description`
- `tasks.course_id`
- `tasks.week_number`
- `tasks.type`
- `tasks.priority`
- `tasks.status`
- `tasks.due_date`
- `tasks.due_time`
- `tasks.reminder`
- `tasks.reminder_value`
- `tasks.reminder_unit`
- `tasks.is_recurring`
- `tasks.repeat_frequency`
- `tasks.repeat_interval`

### 5.9 حدث: تعديل أو حذف task

الفرونت:
- `PUT/PATCH /tasks/{id}`
- `DELETE /tasks/{id}`

Laravel:
- `TaskController@update`
- `TaskController@destroy`

الحفظ:
- update/delete مباشر في `tasks`

### 5.10 حدث: إضافة Self-Learning Plan

الفرونت:
- `POST /self-learning`

Laravel:
- `LearningController@store`

الحفظ:
- صف جديد في `learning_plans`
- وإذا أرسل الفرونت `stages/milestones` تحفظ كـ JSON

حدث إضافي:
- Notification: `Learning Plan Created`

### 5.11 حدث: إضافة أو تعديل Stage داخل Self-Learning

الفرونت:
- `POST /self-learning/{id}/stages`
- `PUT /self-learning/{id}/stages/{stageId}`

الحفظ:
- لا يوجد جدول stages منفصل
- يتم تعديل array داخل `learning_plans.stages`

### 5.12 حدث: إضافة أو تعديل Milestone

الفرونت:
- `POST /self-learning/{id}/milestones`
- `PUT /self-learning/{id}/milestones/{milestoneId}`

الحفظ:
- لا يوجد جدول milestones منفصل
- يتم تعديل JSON داخل `learning_plans.milestones`

### 5.13 حدث: إضافة Resource

الفرونت:
- `POST /resources`

Laravel:
- `ResourceController@store`

الحفظ:
- `resources.resourceable_id`
- `resources.resourceable_type`
- `resources.title`
- `resources.type`
- `resources.url`
- `resources.description`

حدث إضافي:
- notification جديدة بحسب العنصر المرتبط

### 5.14 حدث: إضافة Exam Prep Topic

الفرونت:
- `POST /exam-prep/{weekItemId}/topics`

الحفظ:
- `exam_topics.week_item_id`
- `exam_topics.title`
- `exam_topics.completed`
- `exam_topics.priority`
- `exam_topics.notes`

### 5.15 حدث: حفظ Reflection

الفرونت:
- `POST /reflections`

الحفظ:
- `reflections.title`
- `reflections.date`
- `reflections.mood`
- `reflections.achievements`
- `reflections.difficulties`
- `reflections.learnings`
- `reflections.improvements`
- `reflections.gratitude`
- `reflections.tags`

حدث إضافي:
- notification نجاح

### 5.16 حدث: حفظ Focus Session

الفرونت:
- `POST /focus/sessions`

الحفظ:
- `focus_sessions.minutes`
- `focus_sessions.type`
- `focus_sessions.mode`
- `focus_sessions.linked_task_id`
- `focus_sessions.linked_course_id`
- `focus_sessions.start_time`
- `focus_sessions.end_time`
- `focus_sessions.completed`
- `focus_sessions.notes`

حدث إضافي:
- notification نجاح باسم `Focus Session Saved`

### 5.17 حدث: إشعار ديدلاين أو اقتراب امتحان

الفرونت:
- يطلب `POST /notifications/sync`

Laravel:
- `NotificationController@sync`

Laravel يفحص:
- `tasks`
- `courses`
- `weekly_plans`
- `learning_plans`
- milestones
- stage tasks
- exams

ثم إذا وجد حدث ضمن نافذة التذكير:
- ينشئ أو يحدث صفًا في `notifications`
- يستخدم `source_key` حتى لا يكرر نفس الإشعار
- يحفظ `event_date` ليعرضه بترتيب صحيح

## 6. من أين تأتي البيانات لكل صفحة؟

### Dashboard

يجلب من:

- `/dashboard/stats`
- `/dashboard/tasks`
- `/dashboard/academic-summary`
- `/notifications`

ومعتمد أيضًا على:
- `courses`
- `tasks`
- `learning_plans`
- `semesters`

### Academic Planning

يعتمد على:

- `semesters`
- `courses`

### Courses

يعتمد على:

- `courses`
- `weekly_plans`
- `resources`
- exam prep by `weekItemId`

### Tasks

يعتمد على:

- `tasks`
- وأيضًا يدمج مشتقات من:
  - `courses.weekly_plans`
  - `learning_plans.stages`
  - `learning_plans.milestones`

### Self Learning

يعتمد على:

- `learning_plans`
- `resources`

### Reflections

يعتمد على:

- `reflections`

### Focus

يعتمد على:

- `focus_sessions`

### Notifications

يعتمد على:

- `notifications`
- وأحيانًا على `POST /notifications/sync` لتوليد إشعارات المواعيد

## 7. ملاحظات معمارية مهمة جدًا

### ملاحظة 1

ليس كل شيء محفوظ بجداول فرعية مستقلة.

بعض البيانات محفوظة كـ JSON داخل الجدول الأب، مثل:

- `learning_plans.stages`
- `learning_plans.milestones`
- `weekly_plans.study_tasks`
- `weekly_plans.assignments`
- `weekly_plans.exams`

### ملاحظة 2

الجداول القديمة التالية موجودة تاريخيًا:

- `study_tasks`
- `assignments`

لكن المسار الحالي في الواجهة والباك يعتمد عمليًا أكثر على JSON داخل `weekly_plans`.

### ملاحظة 3

`notifications` فيها نوعان:

- إشعارات مباشرة ناتجة عن event مثل:
  - إنشاء كورس
  - تعديل سمستر
  - حفظ reflection
- إشعارات مولدة تلقائيًا من deadlines عبر `sync`

### ملاحظة 4

البحث الشامل في الواجهة لا يعتمد على جدول منفصل للبحث، بل يجمع من عدة endpoints ويكوّن نتائج البحث منها.

## 8. شرح جاهز سريع 

يمكنك شرح الباك اند بهذه الصيغة:

1. عملنا Laravel API منظّم لكل موديول في النظام: auth, courses, semesters, tasks, self-learning, reflections, focus, notifications.
2. كل حدث في الواجهة يرسل request واضح إلى endpoint محدد.
3. كل endpoint يعمل validation ثم يحفظ البيانات في الجدول المناسب.
4. بعض البيانات الأساسية محفوظة بجداول مستقلة مثل users/courses/tasks/semesters.
5. بعض البيانات الديناميكية والمعقدة مثل weekly items وself-learning stages حفظناها كـ JSON داخل الجداول الرئيسية لتسهيل المرونة مع الواجهة.
6. أضفنا نظام notifications بحيث بعض الإشعارات تنشأ مباشرة عند الحدث، وبعضها يتولد تلقائيًا عندما يقترب deadline أو exam.
7. كل البيانات المرتجعة للفرونت تمر على mapping حتى يكون شكلها مناسب للـ UI.

## 9. الملفات المرجعية الأهم

- [api.php](/studyflow-backend/routes/api.php)
- [AuthController.php](/studyflow-backend/app/Http/Controllers/Api/AuthController.php)
- [SemesterController.php](/studyflow-backend/app/Http/Controllers/Api/SemesterController.php)
- [CourseController.php](/studyflow-backend/app/Http/Controllers/Api/CourseController.php)
- [TaskController.php](/studyflow-backend/app/Http/Controllers/Api/TaskController.php)
- [LearningController.php](/studyflow-backend/app/Http/Controllers/Api/LearningController.php)
- [ResourceController.php](/studyflow-backend/app/Http/Controllers/Api/ResourceController.php)
- [FocusController.php](/studyflow-backend/app/Http/Controllers/Api/FocusController.php)
- [ReflectionController.php](/studyflow-backend/app/Http/Controllers/Api/ReflectionController.php)
- [NotificationController.php](/studyflow-backend/app/Http/Controllers/Api/NotificationController.php)
- [FrontendAdvancedMapper.php](/studyflow-backend/app/Support/FrontendAdvancedMapper.php)

