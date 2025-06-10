const API_BASE_URL = 'http://51.68.183.219:8000';

const majors = {
    'فنی مهندسی': [
        'مهندسی کامپیوتر', 'مهندسی برق', 'مهندسی مکانیک', 'مهندسی عمران',
        'مهندسی صنایع', 'مهندسی شیمی', 'مهندسی مواد', 'مهندسی هوافضا',
        'مهندسی نفت', 'مهندسی معماری'
    ],
    'علوم پایه': [
        'ریاضی', 'فیزیک', 'شیمی', 'زیست‌شناسی', 'زمین‌شناسی',
        'آمار', 'علوم کامپیوتر', 'بیوشیمی', 'میکروبیولوژی', 'ژنتیک'
    ],
    'اقتصاد': [
        'اقتصاد', 'مدیریت بازرگانی', 'حسابداری', 'مدیریت مالی',
        'مدیریت صنعتی', 'اقتصاد کشاورزی', 'اقتصاد بین‌الملل',
        'بانکداری', 'بیمه', 'مدیریت دولتی'
    ]
};

// Show Toast
function showToast(message, type = 'error') {
    const toastContainer = document.getElementById('toast');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span class="toast-close">&times;</span>
    `;
    toastContainer.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5000);

    // Close on click
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    });
}

// Parse API Error
function parseApiError(errorData) {
    if (Array.isArray(errorData.detail)) {
        return errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n');
    }
    return errorData.detail || 'خطای ناشناخته';
}

// Populate Majors
function populateMajors(departmentSelect, majorSelect) {
    const department = departmentSelect.value;
    majorSelect.innerHTML = '<option value="">رشته تحصیلی</option>';
    if (majors[department]) {
        majors[department].forEach(major => {
            const option = document.createElement('option');
            option.value = major;
            option.textContent = major;
            majorSelect.appendChild(option);
        });
    }
}

// Load Students
async function loadStudents(search = '') {
    const table = document.getElementById('student-table');
    if (!table) return;
    try {
        const response = await fetch(`${API_BASE_URL}/students/`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        const students = await response.json();
        table.innerHTML = '';
        students
            .filter(student =>
                student.FName.includes(search) ||
                student.LName.includes(search) ||
                student.stid.includes(search)
            )
            .forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border p-2">${student.stid}</td>
                    <td class="border p-2">${student.FName}</td>
                    <td class="border p-2">${student.LName}</td>
                    <td class="border p-2">
                        <a href="student-form.html?edit=${student.stid}" class="edit-btn inline-block bg-yellow-600 text-white font-medium py-1 px-3 rounded-lg hover:bg-yellow-700 transition duration-200">ویرایش</a>
                        <button onclick="deleteStudent('${student.stid}')" class="delete-btn inline-block bg-red-600 text-white font-medium py-1 px-3 rounded-lg hover:bg-red-700 transition duration-200">حذف</button>
                    </td>
                `;
                table.appendChild(row);
            });
    } catch (error) {
        console.error('Error loading students:', error);
        showToast('خطا در بارگذاری دانشجویان: ' + error.message, 'error');
    }
}

// Load Teachers
async function loadTeachers(search = '') {
    const table = document.getElementById('teacher-table');
    if (!table) return;
    try {
        const response = await fetch(`${API_BASE_URL}/teachers/`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        const teachers = await response.json();
        table.innerHTML = '';
        teachers
            .filter(teacher =>
                teacher.FName.includes(search) ||
                teacher.LName.includes(search) ||
                teacher.lid.includes(search)
            )
            .forEach(teacher => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border p-2">${teacher.lid}</td>
                    <td class="border p-2">${teacher.FName}</td>
                    <td class="border p-2">${teacher.LName}</td>
                    <td class="border p-2">
                        <a href="teacher-form.html?edit=${teacher.lid}" class="edit-btn inline-block bg-yellow-600 text-white font-medium py-1 px-3 rounded-lg hover:bg-yellow-700 transition duration-200">ویرایش</a>
                        <button onclick="deleteTeacher('${teacher.lid}')" class="delete-btn inline-block bg-red-600 text-white font-medium py-1 px-3 rounded-lg hover:bg-red-700 transition duration-200">حذف</button>
                    </td>
                `;
                table.appendChild(row);
            });
    } catch (error) {
        console.error('Error loading teachers:', error);
        showToast('خطا در بارگذاری اساتید: ' + error.message, 'error');
    }
}

// Load Courses
async function loadCourses(search = '') {
    const table = document.getElementById('course-table');
    if (!table) return;
    try {
        const response = await fetch(`${API_BASE_URL}/courses/`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        const courses = await response.json();
        table.innerHTML = '';
        courses
            .filter(course =>
                course.cname.includes(search) ||
                course.cid.includes(search)
            )
            .forEach(course => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border p-2">${course.cid}</td>
                    <td class="border p-2">${course.cname}</td>
                    <td class="border p-2">${course.department}</td>
                    <td class="border p-2">${course.credit}</td>
                    <td class="border p-2">
                        <a href="course-form.html?edit=${course.cid}" class="edit-btn inline-block bg-yellow-600 text-white font-medium py-1 px-3 rounded-lg hover:bg-yellow-700 transition duration-200">ویرایش</a>
                        <button onclick="deleteCourse('${course.cid}')" class="delete-btn inline-block bg-red-600 text-white font-medium py-1 px-3 rounded-lg hover:bg-red-700 transition duration-200">حذف</button>
                    </td>
                `;
                table.appendChild(row);
            });
    } catch (error) {
        console.error('Error loading courses:', error);
        showToast('خطا در بارگذاری دروس: ' + error.message, 'error');
    }
}

// Edit Student
async function editStudent() {
    const urlParams = new URLSearchParams(window.location.search);
    const stid = urlParams.get('edit');
    if (stid && document.getElementById('student-form')) {
        try {
            document.getElementById('form-title').textContent = 'فرم ویرایش دانشجو - سامانه مدیریت دانشگاه لرستان';
            document.getElementById('form-heading').textContent = 'فرم ویرایش دانشجو';
            document.getElementById('student-submit').textContent = 'ویرایش دانشجو';
            const response = await fetch(`${API_BASE_URL}/students/${stid}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            const student = await response.json();
            document.getElementById('student-fname').value = student.FName;
            document.getElementById('student-lname').value = student.LName;
            document.getElementById('student-id').value = student.ID;
            document.getElementById('student-birth').value = student.Birth;
            document.getElementById('student-borncity').value = student.BornCity;
            document.getElementById('student-address').value = student.Address || '';
            document.getElementById('student-postalcode').value = student.PostalCode || '';
            document.getElementById('student-cphone').value = student.Cphone || '';
            document.getElementById('student-hphone').value = student.Hphone || '';
            document.getElementById('student-stid').value = student.stid;
            document.getElementById('student-father').value = student.father;
            document.getElementById('student-ids_number').value = student.ids_number;
            document.getElementById('student-ids_letter').value = student.ids_letter;
            document.getElementById('student-ids_code').value = student.ids_code;
            document.getElementById('student-department').value = student.department;
            populateMajors(document.getElementById('student-department'), document.getElementById('student-major'));
            document.getElementById('student-major').value = student.major;
            document.getElementById('student-married').value = student.married;
            document.getElementById('student-course_id').value = student.course_id;
            document.getElementById('student-form').dataset.edit = stid;
        } catch (error) {
            console.error('Error loading student:', error);
            showToast('خطا در بارگذاری اطلاعات دانشجو: ' + error.message, 'error');
        }
    }
}

// Edit Teacher
async function editTeacher() {
    const urlParams = new URLSearchParams(window.location.search);
    const lid = urlParams.get('edit');
    if (lid && document.getElementById('teacher-form')) {
        try {
            document.getElementById('form-title').textContent = 'فرم ویرایش استاد - سامانه مدیریت دانشگاه لرستان';
            document.getElementById('form-heading').textContent = 'فرم ویرایش استاد';
            document.getElementById('teacher-submit').textContent = 'ویرایش استاد';
            const response = await fetch(`${API_BASE_URL}/teachers/${lid}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            const teacher = await response.json();
            document.getElementById('teacher-fname').value = teacher.FName;
            document.getElementById('teacher-lname').value = teacher.LName;
            document.getElementById('teacher-id').value = teacher.ID;
            document.getElementById('teacher-birth').value = teacher.Birth;
            document.getElementById('teacher-borncity').value = teacher.BornCity;
            document.getElementById('teacher-address').value = teacher.Address || '';
            document.getElementById('teacher-postalcode').value = teacher.PostalCode || '';
            document.getElementById('teacher-cphone').value = teacher.Cphone || '';
            document.getElementById('teacher-hphone').value = teacher.Hphone || '';
            document.getElementById('teacher-lid').value = teacher.lid;
            document.getElementById('teacher-department').value = teacher.department;
            populateMajors(document.getElementById('teacher-department'), document.getElementById('teacher-major'));
            document.getElementById('teacher-major').value = teacher.major;
            document.getElementById('teacher-form').dataset.edit = lid;
        } catch (error) {
            console.error('Error loading teacher:', error);
            showToast('خطا در بارگذاری اطلاعات استاد: ' + error.message, 'error');
        }
    }
}

// Edit Course
async function editCourse() {
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('edit');
    if (cid && document.getElementById('course-form')) {
        try {
            document.getElementById('form-title').textContent = 'فرم ویرایش درس - سامانه مدیریت دانشگاه لرستان';
            document.getElementById('form-heading').textContent = 'فرم ویرایش درس';
            document.getElementById('course-submit').textContent = 'ویرایش درس';
            const response = await fetch(`${API_BASE_URL}/courses/${cid}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            const course = await response.json();
            document.getElementById('course-cid').value = course.cid;
            document.getElementById('course-cname').value = course.cname;
            document.getElementById('course-department').value = course.department;
            document.getElementById('course-credit').value = course.credit;
            document.getElementById('course-form').dataset.edit = cid;
        } catch (error) {
            console.error('Error loading course:', error);
            showToast('خطا در بارگذاری اطلاعات درس: ' + error.message, 'error');
        }
    }
}

// Create/Update Student
if (document.getElementById('student-form')) {
    document.getElementById('student-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const student = {
            FName: document.getElementById('student-fname').value,
            LName: document.getElementById('student-lname').value,
            ID: document.getElementById('student-id').value,
            Birth: document.getElementById('student-birth').value,
            BornCity: document.getElementById('student-borncity').value,
            Address: document.getElementById('student-address').value || null,
            PostalCode: document.getElementById('student-postalcode').value || null,
            Cphone: document.getElementById('student-cphone').value || null,
            Hphone: document.getElementById('student-hphone').value || null,
            stid: document.getElementById('student-stid').value,
            father: document.getElementById('student-father').value,
            ids_number: document.getElementById('student-ids_number').value,
            ids_letter: document.getElementById('student-ids_letter').value,
            ids_code: document.getElementById('student-ids_code').value,
            department: document.getElementById('student-department').value,
            major: document.getElementById('student-major').value,
            married: document.getElementById('student-married').value,
            course_id: document.getElementById('student-course_id').value
        };
        const method = document.getElementById('student-form').dataset.edit ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `${API_BASE_URL}/students/${document.getElementById('student-form').dataset.edit}` : `${API_BASE_URL}/students/`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(parseApiError(errorData));
            }
            showToast(method === 'PUT' ? 'دانشجو با موفقیت ویرایش شد' : 'دانشجو با موفقیت ثبت شد', 'success');
            window.location.href = 'list.html#students';
        } catch (error) {
            console.error('Error saving student:', error);
            showToast('خطا در ثبت/ویرایش دانشجو: ' + error.message, 'error');
        }
    });
}

// Create/Update Teacher
if (document.getElementById('teacher-form')) {
    document.getElementById('teacher-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const teacher = {
            FName: document.getElementById('teacher-fname').value,
            LName: document.getElementById('teacher-lname').value,
            ID: document.getElementById('teacher-id').value,
            Birth: document.getElementById('teacher-birth').value,
            BornCity: document.getElementById('teacher-borncity').value,
            Address: document.getElementById('teacher-address').value || null,
            PostalCode: document.getElementById('teacher-postalcode').value || null,
            Cphone: document.getElementById('teacher-cphone').value || null,
            Hphone: document.getElementById('teacher-hphone').value || null,
            lid: document.getElementById('teacher-lid').value,
            department: document.getElementById('teacher-department').value,
            major: document.getElementById('teacher-major').value
        };
        const method = document.getElementById('teacher-form').dataset.edit ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `${API_BASE_URL}/teachers/${document.getElementById('teacher-form').dataset.edit}` : `${API_BASE_URL}/teachers/`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teacher)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(parseApiError(errorData));
            }
            showToast(method === 'PUT' ? 'استاد با موفقیت ویرایش شد' : 'استاد با موفقیت ثبت شد', 'success');
            window.location.href = 'list.html#teachers';
        } catch (error) {
            console.error('Error saving teacher:', error);
            showToast('خطا در ثبت/ویرایش استاد: ' + error.message, 'error');
        }
    });
}

// Create/Update Course
if (document.getElementById('course-form')) {
    document.getElementById('course-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const course = {
            cid: document.getElementById('course-cid').value,
            cname: document.getElementById('course-cname').value,
            department: document.getElementById('course-department').value,
            credit: parseInt(document.getElementById('course-credit').value)
        };
        const method = document.getElementById('course-form').dataset.edit ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `${API_BASE_URL}/courses/${document.getElementById('course-form').dataset.edit}` : `${API_BASE_URL}/courses/`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(course)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(parseApiError(errorData));
            }
            showToast(method === 'PUT' ? 'درس با موفقیت ویرایش شد' : 'درس با موفقیت ثبت شد', 'success');
            window.location.href = 'list.html#courses';
        } catch (error) {
            console.error('Error saving course:', error);
            showToast('خطا در ثبت/ویرایش درس: ' + error.message, 'error');
        }
    });
}

// Delete Student
async function deleteStudent(stid) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${stid}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        showToast('دانشجو با موفقیت حذف شد', 'success');
        loadStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('خطا در حذف دانشجو: ' + error.message, 'error');
    }
}

// Delete Teacher
async function deleteTeacher(lid) {
    try {
        const response = await fetch(`${API_BASE_URL}/teachers/${lid}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        showToast('استاد با موفقیت حذف شد', 'success');
        loadTeachers();
    } catch (error) {
        console.error('Error deleting teacher:', error);
        showToast('خطا در حذف استاد: ' + error.message, 'error');
    }
}

// Delete Course
async function deleteCourse(cid) {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/${cid}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        showToast('درس با موفقیت حذف شد', 'success');
        loadCourses();
    } catch (error) {
        console.error('Error deleting course:', error);
        showToast('خطا در حذف درس: ' + error.message, 'error');
    }
}

// Tab Switching
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const contentId = tab.id.replace('tab-', '') + '-section';
            document.getElementById(contentId).classList.add('active');
        });
    });

    // Search Handlers
    if (document.getElementById('student-search')) {
        document.getElementById('student-search').addEventListener('input', (e) => loadStudents(e.target.value));
    }
    if (document.getElementById('teacher-search')) {
        document.getElementById('teacher-search').addEventListener('input', (e) => loadTeachers(e.target.value));
    }
    if (document.getElementById('course-search')) {
        document.getElementById('course-search').addEventListener('input', (e) => loadCourses(e.target.value));
    }

    // Initial Load
    loadStudents();
    loadTeachers();
    loadCourses();
    editStudent();
    editTeacher();
    editCourse();
});

// Department Change Handlers
if (document.getElementById('student-department')) {
    document.getElementById('student-department').addEventListener('change', (e) => {
        populateMajors(e.target, document.getElementById('student-major'));
    });
}
if (document.getElementById('teacher-department')) {
    document.getElementById('teacher-department').addEventListener('change', (e) => {
        populateMajors(e.target, document.getElementById('teacher-major'));
    });
}
