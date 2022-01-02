import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { switchMap } from 'rxjs';
import { Paciente } from 'src/app/_model/paciente';
import { PacienteService } from 'src/app/_service/paciente.service';

@Component({
  selector: 'app-paciente-modal',
  templateUrl: './paciente-modal.component.html',
  styleUrls: ['./paciente-modal.component.css'],
})
export class PacienteModalComponent implements OnInit {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<PacienteModalComponent>,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      nombres: new FormControl(''),
      apellidos: new FormControl(''),
      dni: new FormControl(''),
      direccion: new FormControl(''),
      telefono: new FormControl(''),
      email: new FormControl(''),
    });
  }

  operar() {
    let paciente = new Paciente();
    paciente.idPaciente = 0;
    paciente.nombres = this.form.value['nombres'];
    paciente.apellidos = this.form.value['apellidos'];
    paciente.dni = this.form.value['dni'];
    paciente.direccion = this.form.value['direccion'];
    paciente.telefono = this.form.value['telefono'];
    paciente.email = this.form.value['email'];

    console.log(paciente);

    //REGISTRAR
    this.pacienteService
      .registrar(paciente)
      .pipe(
        switchMap(() => {
          return this.pacienteService.listar();
        })
      )
      .subscribe((data) => {
        this.pacienteService.setPacienteCambio(data);
        this.pacienteService.setMensajeCambio('SE REGISTRÓ');
        this.cerrar();
      });
  }

  cerrar() {
    this.dialogRef.close();
    /*this.dialogRef.afterClosed().subscribe(result => {
      console.log('cerrar');
    });*/
  }
}
