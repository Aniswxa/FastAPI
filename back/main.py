from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi.middleware.cors import CORSMiddleware
from pydantic import validator
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Human(SQLModel):
    FName: str = Field(index=True)
    LName: str = Field(index=True)
    ID: str = Field(unique=True)
    Birth: str
    BornCity: str
    Address: str | None = Field(default=None, max_length=100)
    PostalCode: str | None = Field(default=None, max_length=10)
    Cphone: str | None = Field(default=None)
    Hphone: str | None = Field(default=None)

    class Config:
        validate_assignment = True
        extra = "forbid"
        strict = True

    @validator("FName", "LName")
    def name_check(cls, v):
        if not re.match(r'^[\u0600-\u06FF\s]+$', v):
            raise ValueError("نام و نام خانوادگی باید با حروف فارسی باشد")
        if len(v) > 10:
            raise ValueError("نام و نام خانوادگی باید حداکثر 10 کاراکتر باشد")
        return v

    @validator("ID")
    def ID_check(cls, v):
        if not re.match(r'^\d{10}$', v):
            raise ValueError("کد ملی باید 10 رقم باشد")
        return v

    @validator("Birth")
    def Birth_check(cls, v):
        try:
            year, month, day = map(int, v.split('/'))
            if not (1300 <= year <= 1405 and 1 <= month <= 12 and 1 <= day <= 31):
                raise ValueError("تاریخ تولد باید بین ۱۳۰۰ تا ۱۴۰۵ باشد")
        except:
            raise ValueError("فرمت تاریخ باید به صورت yyyy/mm/dd باشد")
        return v

    @validator("BornCity")
    def city_check(cls, v):
        cities = [
            "تهران", "مشهد", "اصفهان", "کرج", "شیراز", "تبریز", "قم", "اهواز", "کرمانشاه",
            "ارومیه", "رشت", "زاهدان", "همدان", "کرمان", "یزد", "اردبیل", "بندرعباس",
            "اراک", "اسلامشهر", "زنجان", "سنندج", "قزوین", "خرم‌آباد", "گرگان",
            "ساری", "بجنورد", "بوشهر", "بیرجند", "ایلام", "شهرکرد", "یاسوج"
        ]
        if v not in cities:
            raise ValueError("شهر تولد باید یکی از مراکز استان باشد")
        return v

    @validator("Address")
    def address_check(cls, v):
        if v and not re.match(r'^[\u0600-\u06FF\s]*$', v):
            raise ValueError("آدرس باید فقط حروف فارسی باشد")
        return v

    @validator("PostalCode")
    def PostalCode_check(cls, v):
        if v and not re.match(r'^\d{10}$', v):
            raise ValueError("کد پستی باید 10 رقم باشد")
        return v

    @validator("Cphone")
    def Cphone_check(cls, v):
        if v and not re.match(r'^09\d{9}$', v):
            raise ValueError("تلفن همراه باید با 09 شروع شود و 11 رقم باشد")
        return v

    @validator("Hphone")
    def Hphone_check(cls, v):
        if v and not re.match(r'^0\d{2,3}\d{8}$', v):
            raise ValueError("تلفن ثابت باید مطابق استاندارد ایران باشد")
        return v

class Student(Human, table=True):
    stid: str = Field(primary_key=True)
    father: str
    ids_number: str = Field(max_length=6, min_length=6)
    ids_letter: str = Field(max_length=1)
    ids_code: str = Field(max_length=2, min_length=2)
    department: str
    major: str
    married: str
    course_id: str = Field(max_length=25)

    @validator("stid")
    def validate_stid(cls, v):
        if len(v) != 11 or not v.isdigit():
            raise ValueError("شماره دانشجویی باید 11 رقم باشد")
        prefix = int(v[:3])
        fixed_part = v[3:9]
        if not (300 <= prefix <= 404):
            raise ValueError("سه رقم اول باید عددی بین 300 تا 404 باشد")
        if fixed_part != "114150":
            raise ValueError("شش رقم وسط شماره دانشجویی باید 114150 باشد")
        return v

    @validator("father")
    def validate_father(cls, v):
        if not re.match(r'^[\u0600-\u06FF\s]+$', v):
            raise ValueError("نام پدر باید فقط حروف فارسی باشد")
        return v

    @validator("ids_number")
    def validate_ids_number(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError("سریال شناسنامه باید عدد ۶ رقمی باشد")
        return v

    @validator("ids_letter")
    def validate_ids_letter(cls, v):
        persian_letters = "ا ب پ ت ث ج چ ح خ دذرزژس ش ص ض ط ظ ع غ ف ق ک گ ل م ن وه ی"
        if v not in persian_letters:
            raise ValueError("حرف سریال شناسنامه باید یکی از حروف الفبای فارسی باشد")
        return v

    @validator("ids_code")
    def validate_ids_code(cls, v):
        if not v.isdigit() or len(v) != 2:
            raise ValueError("کد سریال شناسنامه باید عدد ۲ رقمی باشد")
        return v

    @validator("department")
    def validate_department(cls, v):
        departments = ["فنی مهندسی", "علوم پایه", "اقتصاد"]
        if v not in departments:
            raise ValueError("دانشکده باید یکی از فنی مهندسی، علوم پایه یا اقتصاد باشد")
        return v

    @validator("major")
    def validate_major(cls, v):
        majors = {
            "فنی مهندسی": [
                "مهندسی کامپیوتر", "مهندسی برق", "مهندسی مکانیک", "مهندسی عمران",
                "مهندسی صنایع", "مهندسی شیمی", "مهندسی مواد", "مهندسی هوافضا",
                "مهندسی نفت", "مهندسی معماری"
            ],
            "علوم پایه": [
                "ریاضی", "فیزیک", "شیمی", "زیست‌شناسی", "زمین‌شناسی",
                "آمار", "علوم کامپیوتر", "بیوشیمی", "میکروبیولوژی", "ژنتیک"
            ],
            "اقتصاد": [
                "اقتصاد", "مدیریت بازرگانی", "حسابداری", "مدیریت مالی",
                "مدیریت صنعتی", "اقتصاد کشاورزی", "اقتصاد بین‌الملل",
                "بانکداری", "بیمه", "مدیریت دولتی"
            ]
        }
        for dept, major_list in majors.items():
            if v in major_list:
                return v
        raise ValueError("رشته تحصیلی باید یکی از رشته‌های مرتبط با دانشکده باشد")

    @validator("married")
    def validate_married(cls, v):
        if v not in ["مجرد", "متاهل"]:
            raise ValueError("وضعیت تاهل باید مجرد یا متاهل باشد")
        return v

    @validator("course_id")
    def validate_course_id(cls, v):
        if not re.match(r'^[آ-ی0-9]+$', v):
            raise ValueError("کد درس باید فقط شامل حروف فارسی و ارقام باشد")
        return v

class Teacher(Human, table=True):
    lid: str = Field(primary_key=True)
    department: str
    major: str

    @validator("lid")
    def validate_lid(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError("کد استاد باید عدد ۶ رقمی باشد")
        return v

    @validator("department")
    def validate_department(cls, v):
        departments = ["فنی مهندسی", "علوم پایه", "اقتصاد"]
        if v not in departments:
            raise ValueError("دانشکده باید یکی از مجازها باشد")
        return v

    @validator("major")
    def validate_major(cls, v):
        majors = {
            "فنی مهندسی": [
                "مهندسی کامپیوتر", "مهندسی برق", "مهندسی مکانیک", "مهندسی عمران",
                "مهندسی صنایع", "مهندسی شیمی", "مهندسی مواد", "مهندسی هوافضا",
                "مهندسی نفت", "مهندسی معماری"
            ],
            "علوم پایه": [
                "ریاضی", "فیزیک", "شیمی", "زیست‌شناسی", "زمین‌شناسی",
                "آمار", "علوم کامپیوتر", "بیوشیمی", "میکروبیولوژی", "ژنتیک"
            ],
            "اقتصاد": [
                "اقتصاد", "مدیریت بازرگانی", "حسابداری", "مدیریت مالی",
                "مدیریت صنعتی", "اقتصاد کشاورزی", "اقتصاد بین‌الملل",
                "بانکداری", "بیمه", "مدیریت دولتی"
            ]
        }
        for dept, major_list in majors.items():
            if v in major_list:
                return v
        raise ValueError("رشته تحصیلی باید یکی از رشته‌های مرتبط با دانشکده باشد")

class Course(SQLModel, table=True):
    cid: str = Field(primary_key=True)
    cname: str
    department: str
    credit: int

    class Config:
        validate_assignment = True
        extra = "forbid"
        strict = True

    @validator("cid")
    def validate_cid(cls, v):
        if not v.isdigit() or len(v) != 5:
            raise ValueError("کد درس باید عدد ۵ رقمی باشد")
        return v

    @validator("cname")
    def validate_cname(cls, v):
        if not re.fullmatch(r'[آ-ی\s]{1,25}', v):
            raise ValueError("نام درس باید فقط حروف فارسی و حداکثر ۲۵ کاراکتر باشد")
        return v

    @validator("department")
    def validate_department(cls, v):
        departments = ["فنی مهندسی", "علوم پایه", "اقتصاد"]
        if v not in departments:
            raise ValueError("دانشکده معتبر نیست")
        return v

    @validator("credit")
    def validate_credit(cls, v):
        if not (1 <= v <= 4):
            raise ValueError("تعداد واحد باید بین ۱ تا ۴ باشد")
        return v

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.post("/students/")
def create_student(student: Student, session: SessionDep) -> Student:
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

@app.get("/students/")
def read_students(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Student]:
    students = session.exec(select(Student).offset(offset).limit(limit)).all()
    return students

@app.get("/students/{stid}")
def read_student(stid: str, session: SessionDep) -> Student:
    student = session.get(Student, stid)
    if not student:
        raise HTTPException(status_code=404, detail="دانشجو یافت نشد")
    return student

@app.put("/students/{stid}")
def update_student(stid: str, student: Student, session: SessionDep) -> Student:
    db_student = session.get(Student, stid)
    if not db_student:
        raise HTTPException(status_code=404, detail="دانشجو یافت نشد")
    student_data = student.dict(exclude_unset=True)
    for key, value in student_data.items():
        setattr(db_student, key, value)
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    return db_student

@app.delete("/students/{stid}")
def delete_student(stid: str, session: SessionDep):
    student = session.get(Student, stid)
    if not student:
        raise HTTPException(status_code=404, detail="دانشجو یافت نشد")
    session.delete(student)
    session.commit()
    return {"ok": True}

@app.post("/teachers/")
def create_teacher(teacher: Teacher, session: SessionDep) -> Teacher:
    session.add(teacher)
    session.commit()
    session.refresh(teacher)
    return teacher

@app.get("/teachers/")
def read_teachers(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Teacher]:
    return session.exec(select(Teacher).offset(offset).limit(limit)).all()

@app.get("/teachers/{lid}")
def read_teacher(lid: str, session: SessionDep) -> Teacher:
    teacher = session.get(Teacher, lid)
    if not teacher:
        raise HTTPException(status_code=404, detail="استاد یافت نشد")
    return teacher

@app.put("/teachers/{lid}")
def update_teacher(lid: str, teacher: Teacher, session: SessionDep) -> Teacher:
    db_teacher = session.get(Teacher, lid)
    if not db_teacher:
        raise HTTPException(status_code=404, detail="استاد یافت نشد")
    teacher_data = teacher.dict(exclude_unset=True)
    for key, value in teacher_data.items():
        setattr(db_teacher, key, value)
    session.add(db_teacher)
    session.commit()
    session.refresh(db_teacher)
    return db_teacher

@app.delete("/teachers/{lid}")
def delete_teacher(lid: str, session: SessionDep):
    teacher = session.get(Teacher, lid)
    if not teacher:
        raise HTTPException(status_code=404, detail="استاد یافت نشد")
    session.delete(teacher)
    session.commit()
    return {"ok": True}

@app.post("/courses/")
def create_course(course: Course, session: SessionDep) -> Course:
    session.add(course)
    session.commit()
    session.refresh(course)
    return course

@app.get("/courses/")
def read_courses(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Course]:
    return session.exec(select(Course).offset(offset).limit(limit)).all()

@app.get("/courses/{cid}")
def read_course(cid: str, session: SessionDep) -> Course:
    course = session.get(Course, cid)
    if not course:
        raise HTTPException(status_code=404, detail="درس یافت نشد")
    return course

@app.put("/courses/{cid}")
def update_course(cid: str, course: Course, session: SessionDep) -> Course:
    db_course = session.get(Course, cid)
    if not db_course:
        raise HTTPException(status_code=404, detail="درس یافت نشد")
    course_data = course.dict(exclude_unset=True)
    for key, value in course_data.items():
        setattr(db_course, key, value)
    session.add(db_course)
    session.commit()
    session.refresh(db_course)
    return db_course

@app.delete("/courses/{cid}")
def delete_course(cid: str, session: SessionDep):
    course = session.get(Course, cid)
    if not course:
        raise HTTPException(status_code=404, detail="درس یافت نشد")
    session.delete(course)
    session.commit()
    return {"ok": True}

print()