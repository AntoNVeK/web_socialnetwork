import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-edit-profile',
  standalone: false,
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  editForm: FormGroup;
  loading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  showFormErrors = false;
  statusInfo = '';

  
  private readonly nameRegex = /^[A-Za-zА-Яа-яЁё\s\-]+$/; // Буквы, пробелы и дефисы
  private readonly emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  constructor(
    private fb: FormBuilder,
    public userService: UserService,
    private router: Router
  ) {
    this.editForm = this.createForm();
  }

  ngOnInit() {
    this.loadUserData();
    this.setupFormListeners();
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.nameValidator.bind(this)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.nameValidator.bind(this)
      ]],
      middleName: ['', [
        Validators.maxLength(50),
        this.optionalNameValidator.bind(this)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        this.emailValidator.bind(this)
      ]],
      birthDate: ['', [
        this.birthDateValidator.bind(this)
      ]],
    });
  }

  // Добавляем слушатели изменений формы
  private setupFormListeners() {
    // Слушаем изменения формы для обновления статуса
    this.editForm.valueChanges.subscribe(() => {
      this.updateStatusInfo();
    });

    // Слушаем изменения валидности
    this.editForm.statusChanges.subscribe(() => {
      this.updateStatusInfo();
    });
  }

  // Метод для обновления информации в статусе
  private updateStatusInfo() {
    if (this.editForm.dirty) {
      if (this.editForm.valid) {
        this.statusInfo = 'Все данные корректны. Можно сохранять.';
      } else {
        const invalidFields = this.getInvalidFieldsCount();
        this.statusInfo = `Заполнено неверно: ${invalidFields} поле(й)`;
      }
    } else {
      this.statusInfo = 'Внесите изменения для сохранения';
    }
  }

  // Метод для подсчета невалидных полей
  private getInvalidFieldsCount(): number {
    let count = 0;
    Object.keys(this.editForm.controls).forEach(key => {
      if (this.editForm.get(key)?.invalid) {
        count++;
      }
    });
    return count;
  }

  // Валидатор для обязательных имен (ФИ)
  private nameValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    const value = control.value.trim();

    if (!this.nameRegex.test(value)) {
      return { 'invalidName': 'ФИО может содержать только буквы, пробелы и дефисы' };
    }

    // Проверка на несколько пробелов подряд
    if (/\s{2,}/.test(value)) {
      return { 'invalidSpaces': 'Нельзя использовать несколько пробелов подряд' };
    }

    // Проверка на дефисы в начале/конце
    if (value.startsWith('-') || value.endsWith('-')) {
      return { 'invalidHyphen': 'Дефис не может быть в начале или конце' };
    }

    return null;
  }

  // Валидатор для необязательного отчества
  private optionalNameValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null; // Пустое значение разрешено
    }

    return this.nameValidator(control);
  }

  // Валидатор для email
  private emailValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    const value = control.value.trim();

    if (!this.emailRegex.test(value)) {
      return { 'invalidEmail': 'Введите корректный email адрес' };
    }

    return null;
  }

  // Валидатор для даты рождения
  private birthDateValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null; // Пустая дата разрешена
    }

    const selectedDate = new Date(control.value);
    const today = new Date();

    // Проверка что дата не в будущем
    if (selectedDate > today) {
      return { 'futureDate': 'Дата рождения не может быть в будущем' };
    }

    // Проверка что возраст не больше 150 лет
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 150);

    if (selectedDate < minDate) {
      return { 'tooOld': 'Дата рождения не может быть более 150 лет назад' };
    }

    // Проверка что возраст не меньше 5 лет (для примера)
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 5);

    if (selectedDate > maxDate) {
      return { 'tooYoung': 'Возраст должен быть не менее 5 лет' };
    }

    return null;
  }

  loadUserData() {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.editForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        middleName: user.middleName || '',
        email: user.email || '',
        birthDate: user.birthDate || '',
      });

      // Устанавливаем превью текущего фото
      if (user.photo) {
        this.imagePreview = this.userService.getPhotoUrl(user.photo);
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.match('image.*')) {
        this.errorMessage = 'Пожалуйста, выберите файл изображения';
        this.statusInfo = 'Ошибка: выберите изображение';
        return;
      }

      // Проверяем размер файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Файл слишком большой. Максимальный размер: 5MB';
        this.statusInfo = 'Ошибка: файл слишком большой';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';
      this.statusInfo = 'Фото готово к загрузке';

      // Создаем превью
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  removePhoto() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.statusInfo = 'Фото будет удалено при сохранении';
  }

  async onSubmit() {
    // Помечаем все поля как touched при попытке сабмита
    this.markFormGroupTouched();
    
    if (this.editForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.statusInfo = 'Сохранение данных...';

      try {
        const formData = new FormData();

        // Добавляем ВСЕ поля формы, включая пустые значения
        Object.keys(this.editForm.value).forEach(key => {
          const value = this.editForm.value[key];
          formData.append(key, value !== null && value !== undefined ? value : '');
        });

        // Добавляем информацию об удалении фото, если нужно
        if (!this.selectedFile && this.imagePreview === null) {
          formData.append('isDeletePhoto', 'true');
        }

        if (this.selectedFile) {
          formData.append('photo', this.selectedFile, this.selectedFile.name);
        }

        console.log('Sending form data with fields:', Object.keys(this.editForm.value));
        
        const updatedUserResponse = await this.userService.updateProfile(formData);

        if (updatedUserResponse.user && updatedUserResponse.success) {
          this.statusInfo = 'Данные успешно сохранены!';
          // Задержка перед переходом чтобы пользователь увидел сообщение
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 1000);
        } else {
          this.errorMessage = updatedUserResponse.error || 'Ошибка при обновлении профиля';
          this.statusInfo = 'Ошибка сохранения';
        }
      } catch (error: any) {
        this.errorMessage = error.error?.error || 'Ошибка при обновлении профиля';
        this.statusInfo = 'Ошибка сохранения';
        console.error('Update profile error:', error);
      } finally {
        this.loading = false;
      }
    } else {
      // Форма невалидна - показываем все ошибки
      this.showFormErrors = true;
      this.statusInfo = 'Исправьте ошибки в форме';
      this.scrollToFirstError();
    }
  }

  onCancel() {
    if (this.editForm.dirty) {
      this.statusInfo = 'Изменения не сохранены';
    }
    this.router.navigate(['/profile']);
  }

  private markFormGroupTouched() {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
    // Также помечаем всю форму как touched
    this.editForm.markAsTouched();
  }

  private scrollToFirstError() {
    const firstErrorElement = document.querySelector('.mat-form-field.ng-invalid');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Геттеры для удобного доступа к полям формы
  get firstName() { return this.editForm.get('firstName'); }
  get lastName() { return this.editForm.get('lastName'); }
  get middleName() { return this.editForm.get('middleName'); }
  get email() { return this.editForm.get('email'); }
  get birthDate() { return this.editForm.get('birthDate'); }

  // Вспомогательные методы для отображения ошибок в шаблоне
  getFirstNameErrors(): string {
    const errors = this.firstName?.errors;
    if (!errors) return '';

    if (errors['required']) return 'Имя обязательно для заполнения';
    if (errors['minlength']) return `Минимальная длина: ${errors['minlength'].requiredLength} символов`;
    if (errors['maxlength']) return `Максимальная длина: ${errors['maxlength'].requiredLength} символов`;
    if (errors['invalidName']) return errors['invalidName'];
    if (errors['invalidSpaces']) return errors['invalidSpaces'];
    if (errors['invalidHyphen']) return errors['invalidHyphen'];

    return 'Некорректное имя';
  }

  getLastNameErrors(): string {
    const errors = this.lastName?.errors;
    if (!errors) return '';

    if (errors['required']) return 'Фамилия обязательна для заполнения';
    if (errors['minlength']) return `Минимальная длина: ${errors['minlength'].requiredLength} символов`;
    if (errors['maxlength']) return `Максимальная длина: ${errors['maxlength'].requiredLength} символов`;
    if (errors['invalidName']) return errors['invalidName'];
    if (errors['invalidSpaces']) return errors['invalidSpaces'];
    if (errors['invalidHyphen']) return errors['invalidHyphen'];

    return 'Некорректная фамилия';
  }

  getMiddleNameErrors(): string {
    const errors = this.middleName?.errors;
    if (!errors) return '';

    if (errors['maxlength']) return `Максимальная длина: ${errors['maxlength'].requiredLength} символов`;
    if (errors['invalidName']) return errors['invalidName'];
    if (errors['invalidSpaces']) return errors['invalidSpaces'];
    if (errors['invalidHyphen']) return errors['invalidHyphen'];

    return 'Некорректное отчество';
  }

  getEmailErrors(): string {
    const errors = this.email?.errors;
    if (!errors) return '';

    if (errors['required']) return 'Email обязателен для заполнения';
    if (errors['email']) return 'Введите корректный email адрес';
    if (errors['invalidEmail']) return errors['invalidEmail'];

    return 'Некорректный email';
  }

  getBirthDateErrors(): string {
    const errors = this.birthDate?.errors;
    if (!errors) return '';

    if (errors['futureDate']) return errors['futureDate'];
    if (errors['tooOld']) return errors['tooOld'];
    if (errors['tooYoung']) return errors['tooYoung'];

    return 'Некорректная дата рождения';
  }

  getMaxBirthDate(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 5);
    return today.toISOString().split('T')[0];
  }

  getMinBirthDate(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 150);
    return today.toISOString().split('T')[0];
  }
}