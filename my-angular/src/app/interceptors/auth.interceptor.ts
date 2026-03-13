import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Клонируем запрос и добавляем withCredentials
  const clonedRequest = req.clone({
    withCredentials: true // для сессий!
  });

  // Продолжаем цепочку с измененным запросом
  return next(clonedRequest);
};