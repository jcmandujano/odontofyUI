import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { PacientesService } from 'src/app/services/pacientes/pacientes.services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Paciente } from 'src/app/services/pacientes/pacientes.model';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

@Component({
  selector: 'app-crear-pacientes',
  templateUrl: './crear-pacientes.component.html',
  styleUrls: ['./crear-pacientes.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class CrearPacientesComponent implements OnInit {
  crearPacientesForm: FormGroup
  patient: any //crear modelo de paciente y tipear esto
  spinner= false
  pacienteId: any //if this value exist, we enable update mode
  constructor(private elementRef: ElementRef, 
    private pacientesService: PacientesService, 
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) { 
    this.crearPacientesForm = this.buildPacientesForm()
  }

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.paramMap.get('id');
    if(this.pacienteId){
      this.spinner = true
      this.pacientesService.buscarPaciente(this.pacienteId).subscribe(data=>{
        this.patchValuesToEdit(data.patient)
        this.spinner = false
      },(error)=>{
        this.spinner = false
        console.log('ERROR', error.error.error.message)
        this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
      })
    }
  }

  //this changes background on load
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
  }

  patchValuesToEdit(paciente: Paciente){
   // console.log('QUE FECHA TRAES', this.calculaEdad(new Date(paciente.fecha_nacimiento).toISOString()))
     this.crearPacientesForm.patchValue({
      name: paciente.name,
      middle_name: paciente.middle_name,
      last_name: paciente.last_name,
      date_of_birth: paciente.date_of_birth,
      age:  this.calculaEdad(new Date(paciente.date_of_birth).toISOString()),
      gender: paciente.gender,
      occupation: paciente.occupation,
      marital_status: paciente.marital_status,
      email: paciente.email,
      phone: paciente.phone,
      address: paciente.address,
      rfc: paciente.rfc,
      reason_for_consultation: paciente.reason_for_consultation,
      emergency_contact_name: paciente.emergency_contact_name,
      emergency_contact_relationship: paciente.emergency_contact_relationship,
      emergency_contact_phone: paciente.emergency_contact_phone,
      family_medical_history: paciente.family_medical_history,
      personal_medical_history: paciente.personal_medical_history,
     })
  }

  //guarda la informacion del paciente
  crearPaciente(){
    if(this.crearPacientesForm.valid){
      this.spinner = true
      this.patient = this.crearPacientesForm.value
      this.pacientesService.creaPaciente(this.patient).subscribe(data=>{
        this.openSnackbar('Se guardo la informacion correctamente', 'Ok')
        this.router.navigate(['/lista-pacientes'])
        this.spinner = false
      },(error)=>{
        this.spinner = false
        console.log('ERROR', error)
        this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
      })
    }
  }

  actualizarPaciente(){
    if(this.crearPacientesForm.valid){
      this.spinner = true
      this.patient = this.crearPacientesForm.value
      this.pacientesService.actualizaPaciente(this.pacienteId, this.patient).subscribe(data=>{
        this.openSnackbar('Se actualizó la informacion correctamente', 'Ok')
        this.router.navigate(['/lista-pacientes'])
        this.spinner = false
      },(error)=>{
        this.spinner = false
        console.log('ERROR', error)
        this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok')
      })
    }
  }

  //hook al cambiar el valor de la fecha de nacimiento
  onDateChange(eventChange: MatDatepickerInputEvent<Date>){
    const edad = this.calculaEdad(moment(eventChange.value).format())
    if(edad){
      this.crearPacientesForm.patchValue({age: edad})
    }
  }

  //calcula la edad en funcion de la decha de nacimiento
  calculaEdad(dateString: string): number {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
    {
        age--;
    }
    return age;
  }

  //mostramos el error de email por valido o por formato
  getEmailErrorMessage() {
    if (this.crearPacientesForm.controls['email'].hasError('required')) {
      return 'Debes ingresar el email';
    }

    return this.crearPacientesForm.controls['email'].hasError('email') ? 'No es un email valido' : '';
  }

  //mostramos el error de telefono por valido o por formato
  getPhoneErrorMessage() {
    if (this.crearPacientesForm.controls['phone'].hasError('required')) {
      return 'Debes ingresar el email';
    }

    return this.crearPacientesForm.controls['phone'].hasError('pattern') ? 'No es un telefono valido' : '';
  }

  buildPacientesForm(): FormGroup{
    return new FormGroup({
      name: new FormControl('', Validators.required),
      middle_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required),
      age: new FormControl({ value: '', disabled: true }),
      date_of_birth: new FormControl('', Validators.required),
      gender: new FormControl(''),
      occupation: new FormControl(''),
      marital_status: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern('[- +()0-9]+')]),
      address: new FormControl(''),
      rfc: new FormControl(''),
      reason_for_consultation: new FormControl(''),
      emergency_contact_name: new FormControl(''),
      emergency_contact_relationship: new FormControl(''),
      emergency_contact_phone: new FormControl(''),
      family_medical_history: new FormControl(''),
      personal_medical_history: new FormGroup({
        bajoTratamientoMedico: new FormGroup({//pasar todo esto a inglés
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        intervencionQuirurgica: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        consumeDrogas: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        problemasPresion: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        hepatitis: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        vih: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        ets: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        problemaCorazon: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        fiebreReumatica: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        asma: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        diabetes: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        ulceraGastrica: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        tiroides: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        alergias: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        epilepsia: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        gastritis: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        }),
        embarazo: new FormGroup({
          respuesta: new FormControl(''),
          comentarios: new FormControl('')
        })

      })
    })
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
