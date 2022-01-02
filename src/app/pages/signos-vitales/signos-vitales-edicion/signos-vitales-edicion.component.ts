import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { map, Observable, switchMap } from 'rxjs';
import { Paciente } from 'src/app/_model/paciente';
import { Signos } from 'src/app/_model/signos';
import { PacienteService } from 'src/app/_service/paciente.service';
import { SignosService } from 'src/app/_service/signos.service';
import { PacienteModalComponent } from '../paciente-modal/paciente-modal.component';

@Component({
  selector: 'app-signos-vitales-edicion',
  templateUrl: './signos-vitales-edicion.component.html',
  styleUrls: ['./signos-vitales-edicion.component.css'],
})
export class SignosVitalesEdicionComponent implements OnInit {
  form: FormGroup;
  id: number;
  edicion: boolean;
  pacientes: Paciente[];
  pacientesFiltrados$: Observable<Paciente[]>;

  myControlPaciente: FormControl = new FormControl();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pacienteService: PacienteService,
    private signosService: SignosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      id: new FormControl(0),
      paciente: this.myControlPaciente,
      fecha: new FormControl(''),
      temperatura: new FormControl(''),
      pulso: new FormControl(''),
      ritmoRespiratorio: new FormControl(''),
    });

    this.pacienteService.getPacienteCambio().subscribe((data) => {
      this.pacientes = data;
    });

    this.pacienteService.getMensajeCambio().subscribe((data) => {
      this.snackBar.open(data, 'AVISO', { duration: 2000 });
    });

    this.pacienteService.listar().subscribe((data) => {
      this.pacientes = data;
    });

    this.pacientesFiltrados$ = this.myControlPaciente.valueChanges.pipe(
      map((val) => this.filtrarPacientes(val))
    );

    this.route.params.subscribe((data) => {
      this.id = data['id'];
      this.edicion = data['id'] != null;
      this.initForm();
    });
  }

  mostrarPaciente(val: any) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  filtrarPacientes(val: any) {
    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(
        (el) =>
          el.nombres.toLowerCase().includes(val.nombres.toLowerCase()) ||
          el.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) ||
          el.dni.includes(val.dni)
      );
    }
    return this.pacientes.filter(
      (el) =>
        el.nombres.toLowerCase().includes(val?.toLowerCase()) ||
        el.apellidos.toLowerCase().includes(val?.toLowerCase()) ||
        el.dni.includes(val)
    );
  }

  initForm() {
    if (this.edicion) {
      this.signosService.listarPorId(this.id).subscribe((data) => {
        this.form.setValue({
          id: data.idSignos,
          paciente: data.paciente,
          fecha: data.fecha,
          temperatura: data.temperatura,
          pulso: data.pulso,
          ritmoRespiratorio: data.ritmoRespiratorio,
        });
      });
    }
  }

  operar() {
    let signos = new Signos();
    signos.idSignos = this.form.value['id'];
    signos.paciente = this.form.value['paciente'];

    signos.fecha = moment(this.form.value['fecha']).format(
      'YYYY-MM-DDTHH:mm:ss'
    );
    signos.temperatura = this.form.value['temperatura'];
    signos.pulso = this.form.value['pulso'];
    signos.ritmoRespiratorio = this.form.value['ritmoRespiratorio'];
    if (this.edicion) {
      //MODIFICAR
      //PRACTICA COMUN, NO IDEAL
      this.signosService.modificar(signos).subscribe(() => {
        this.signosService.listar().subscribe((data) => {
          this.signosService.setSignosCambio(data);
          this.signosService.setMensajeCambio('SE MODIFICO');
        });
      });
    } else {
      //REGISTRAR
      //PRACTICA IDEAL, OPERADORES REACTIVOS op switchMap
      this.signosService
        .registrar(signos)
        .pipe(
          switchMap(() => {
            return this.signosService.listar();
          })
        )
        .subscribe((data) => {
          this.signosService.setSignosCambio(data);
          this.signosService.setMensajeCambio('SE REGISTRO');
        });
    }
    this.router.navigate(['/pages/signos-vitales']);
  }

  abrirDialogo() {
    const dialogRef = this.dialog.open(PacienteModalComponent, {
      width: '250px',
    });

    // dialogRef.afterClosed().subscribe(() => {
    //   this.pacienteService.listar().subscribe((data) => {
    //     this.pacientes = data;
    //   });
    // });
  }
}
