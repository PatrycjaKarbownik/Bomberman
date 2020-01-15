import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '@app/auth/auth.service';

// authorization service testing file
describe('AuthService', () => {
  let authService: AuthService;
  let htc: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
      imports: [
        HttpClientTestingModule
      ]
    });

    authService = TestBed.get(AuthService);
    htc = TestBed.get(HttpTestingController);
  });

  it('should create authorization service', () => {
    expect(authService).toBeTruthy();
  });

  it('should login', () => {
    const login = 'Karmit';

    authService.login(login).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const hr = htc.expectOne('auth/login');
    expect(hr.request.method).toBe('POST');
  });

  it('should renewal token', () => {
    authService.renewalToken().subscribe(response => {
      expect(response).toBeTruthy();
    });

    const hr = htc.expectOne('auth/refresh');
    expect(hr.request.method).toBe('POST');
  });

  it('should check if username exists', () => {
    const username = 'Karmit';

    authService.ifUsernameExists(username).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const hr = htc.expectOne(`user/exists/${username}`);
    expect(hr.request.method).toBe('GET');
  });

});
