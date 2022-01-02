import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  username: string;
  roles: string[];

  constructor() {}

  ngOnInit(): void {
    const helper = new JwtHelperService();
    let token = sessionStorage.getItem(environment.TOKEN_NAME);
    let tokenDecodificado = helper.decodeToken(token);
    this.username = tokenDecodificado.user_name;
    this.roles = tokenDecodificado.authorities;
  }
}
