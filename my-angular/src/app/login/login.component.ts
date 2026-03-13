import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  showFormErrors = false;

  // Регулярные выражения для валидации
  private readonly nameRegex = /^[A-Za-zА-Яа-яЁё\s\-]+$/;
  private readonly emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.nameValidator.bind(this)
      ]],
      firstName: ['', [
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
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(100),
        this.passwordValidator.bind(this)
      ]]
    });
  }

  // Валидатор для имен
  private nameValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    const value = control.value.trim();

    if (!this.nameRegex.test(value)) {
      return { 'invalidName': 'Может содержать только буквы, пробелы и дефисы' };
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
      return null;
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

  // Валидатор для пароля
  private passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    const value = control.value;

    // Проверка на наличие цифр
    if (!/\d/.test(value)) {
      return { 'noDigit': 'Пароль должен содержать хотя бы одну цифру' };
    }

    // Проверка на наличие букв
    if (!/[a-zA-Z]/.test(value)) {
      return { 'noLetter': 'Пароль должен содержать хотя бы одну букву' };
    }

    // Проверка на специальные символы (опционально)
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return { 'noSpecialChar': 'Рекомендуется добавить специальный символ' };
    }

    return null;
  }

  async onSubmit() {
    this.markFormGroupTouched();
    
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.showFormErrors = false;

      try {
        console.log('Отправка данных регистрации:', this.loginForm.value);
        
        // Триммируем значения перед отправкой
        const formData = {
          lastName: this.lastName?.value?.trim(),
          firstName: this.firstName?.value?.trim(),
          middleName: this.middleName?.value?.trim(),
          email: this.email?.value?.trim().toLowerCase(),
          password: this.password?.value
        };

        const response = await this.authService.register(formData);
        
        console.log('Ответ от сервера:', response);
        
        if (response.success) {
          console.log('Регистрация успешна!');
          // Можно добавить сообщение об успехе
          this.showSuccessMessage();
        } else {
          
        }
      } catch (error: any) {
        console.error('Ошибка регистрации:', error);
        this.errorMessage = this.getServerErrorMessage(error.error?.error) || 'Ошибка соединения с сервером';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.showFormErrors = true;
      this.scrollToFirstError();
    }
  }

  // Обработка ошибок с сервера
  private getServerErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'USER_ALREADY_EXISTS': 'Пользователь с таким email уже существует',
      'INVALID_EMAIL': 'Некорректный email адрес',
      'WEAK_PASSWORD': 'Пароль слишком слабый',
      'EMAIL_ALREADY_IN_USE': 'Этот email уже используется',
      'NETWORK_ERROR': 'Ошибка сети. Проверьте подключение к интернету',
      'SERVER_ERROR': 'Ошибка сервера. Попробуйте позже'
    };

    return errorMessages[error] || error || 'Произошла неизвестная ошибка';
  }

  private showSuccessMessage() {
    // Можно добавить красивый тост или сообщение
    console.log('Пользователь успешно зарегистрирован');
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  goToSignIn() {
    this.router.navigate(['/signin']);
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private scrollToFirstError() {
    const firstErrorElement = document.querySelector('.mat-form-field.ng-invalid');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Геттеры для удобного доступа к полям формы
  get lastName() { return this.loginForm.get('lastName'); }
  get firstName() { return this.loginForm.get('firstName'); }
  get middleName() { return this.loginForm.get('middleName'); }
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  // Методы для отображения ошибок в шаблоне
  getLastNameErrors(): string {
    const errors = this.lastName?.errors;
    if (!errors) return '';

    if (errors['required']) return 'Фамилия обязательна';
    if (errors['minlength']) return `Минимум ${errors['minlength'].requiredLength} символа`;
    if (errors['maxlength']) return `Максимум ${errors['maxlength'].requiredLength} символов`;
    if (errors['invalidName']) return errors['invalidName'];
    if (errors['invalidSpaces']) return errors['invalidSpaces'];
    if (errors['invalidHyphen']) return errors['invalidHyphen'];

    return 'Некорректная фамилия';
  }

  getFirstNameErrors(): string {
    const errors = this.firstName?.errors;
    if (!errors) return '';

    if (errors['required']) return 'Имя обязательно';
    if (errors['minlength']) return `Минимум ${errors['minlength'].requiredLength} символа`;
    if (errors['maxlength']) return `Максимум ${errors['maxlength'].requiredLength} символов`;
    if (errors['invalidName']) return errors['invalidName'];
    if (errors['invalidSpaces']) return errors['invalidSpaces'];
    if (errors['invalidHyphen']) return errors['invalidHyphen'];

    return 'Некорректное имя';
  }

  getMiddleNameErrors(): string {
    const errors = this.middleName?.errors;
    if (!errors) return '';

    if (errors['maxlength']) return `Максимум ${errors['maxlength'].requiredLength} символов`;
    if (errors['invalidName']) return errors['invalidName'];
    if (errors['invalidSpaces']) return errors['invalidSpaces'];
    if (errors['invalidHyphen']) return errors['invalidHyphen'];

    return 'Некорректное отчество';
  }

  getEmailErrors(): string {
    const errors = this.email?.errors;
    if (!errors) return '';

    if (errors['required']) return 'Email обязателен';
    if (errors['email']) return 'Введите корректный email';
    if (errors['invalidEmail']) return errors['invalidEmail'];

    return 'Некорректный email';
  }

  getPasswordErrors(): string {
    const errors = this.password?.errors;
    if (!errors) return '';

    if (errors['required']) return 'Пароль обязателен';
    if (errors['minlength']) return `Минимум ${errors['minlength'].requiredLength} символов`;
    if (errors['maxlength']) return `Максимум ${errors['maxlength'].requiredLength} символов`;
    if (errors['noDigit']) return errors['noDigit'];
    if (errors['noLetter']) return errors['noLetter'];
    if (errors['noSpecialChar']) return errors['noSpecialChar'];

    return 'Некорректный пароль';
  }
}