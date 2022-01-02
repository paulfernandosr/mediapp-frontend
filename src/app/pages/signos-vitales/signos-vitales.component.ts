import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Signos } from 'src/app/_model/signos';
import { SignosService } from 'src/app/_service/signos.service';

@Component({
  selector: 'app-signos-vitales',
  templateUrl: './signos-vitales.component.html',
  styleUrls: ['./signos-vitales.component.css'],
})
export class SignosVitalesComponent implements OnInit {
  dataSource: MatTableDataSource<Signos>;
  displayedColumns: string[] = [
    'idSignos',
    'paciente',
    'fecha',
    'temperatura',
    'pulso',
    'ritmoRespiratorio',
    'acciones',
  ];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  cantidad: number;

  constructor(
    private signosService: SignosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.signosService.getMensajeCambio().subscribe((data) => {
      this.snackBar.open(data, 'AVISO', { duration: 2000 });
    });

    this.signosService.getSignosCambio().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });

    this.signosService.listarPageable(0, 10).subscribe((data) => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
    });
  }

  filtrar(e: any) {
    this.dataSource.filter = e.target.value.trim().toLowerCase();
  }

  eliminar(idPaciente: number) {
    this.signosService.eliminar(idPaciente).subscribe(() => {
      this.signosService.listar().subscribe((data) => {
        this.signosService.setSignosCambio(data);
        this.signosService.setMensajeCambio('SE ELIMINO');
      });
    });
  }

  mostrarMas(e: any) {
    this.signosService
      .listarPageable(e.pageIndex, e.pageSize)
      .subscribe((data) => {
        this.cantidad = data.totalElements;
        this.dataSource = new MatTableDataSource(data.content);
      });
  }
}
