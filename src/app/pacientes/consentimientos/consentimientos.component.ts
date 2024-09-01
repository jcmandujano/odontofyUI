import { Component, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InformedConsentService } from 'src/app/services/informed-consent/informed-consent.service';
import { PrintConsentDialogComponent } from '../shared/dialogs/print-consent.dialog/print-consent.dialog.component';
import { InformedConsent } from 'src/app/services/informed-consent/informed.consent.model';
import { NewSignedConsentDialogComponent } from '../shared/dialogs/new-signed-consent.dialog/new-signed-consent.dialog.component';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/services/user/user.model';
import { SessionStorageService } from 'src/app/services/utils/session-storage.service';
import { Paciente } from 'src/app/services/pacientes/pacientes.model';
import { PacientesService } from 'src/app/services/pacientes/pacientes.services';
import { SignedConsentService } from 'src/app/services/signed-consent/signed-consent.service';
import { SignedConsent } from 'src/app/services/signed-consent/signed-consent.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../shared/dialogs/confirm.dialog/confirm.dialog.component';

@Component({
  selector: 'app-consentimientos',
  templateUrl: './consentimientos.component.html',
  styleUrls: ['./consentimientos.component.scss']
})
export class ConsentimientosComponent implements OnInit, AfterViewInit {
  // Columnas a mostrar en la tabla de consentimientos
  displayedColumns: string[] = ['id', 'consent', 'date', 'actions'];
  // Indicador para mostrar el spinner de carga
  spinner = false;
  // Fuente de datos para la tabla
  dataSource: SignedConsent[] = [];
  // Usuario actualmente autenticado
  currentUser: User;
  // Listas de consentimientos informados y firmados
  informedConsentList: InformedConsent[] = [];
  signedConsentList: SignedConsent[] = [];
  // ID del paciente seleccionado
  selectedPatientId: string | null = null;
  // Información del paciente actual
  currentPatient: Paciente;

  /**
   * Constructor del componente donde se inyectan los servicios necesarios.
   * @param sessionService Servicio para manejar la sesión del usuario.
   * @param pacientesService Servicio para obtener información de los pacientes.
   * @param informedConsentService Servicio para manejar los consentimientos informados.
   * @param signedConsentService Servicio para manejar los consentimientos firmados.
   * @param elementRef Referencia al elemento DOM del componente.
   * @param route Servicio de ruta para obtener parámetros de la URL.
   * @param dialog Servicio de diálogo para abrir ventanas modales.
   */
  constructor(
    private sessionService: SessionStorageService,
    private pacientesService: PacientesService,
    private informedConsentService: InformedConsentService,
    private signedConsentService: SignedConsentService,
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    // Inicializar el usuario actual a partir de la sesión almacenada
    this.currentUser = this.sessionService.getUser();
  }

  /**
   * Método de ciclo de vida de Angular que se ejecuta después de que el componente es inicializado.
   * Aquí se cargan los datos iniciales necesarios.
   */
  ngOnInit(): void {
    // Obtener el ID del paciente seleccionado desde la URL
    this.selectedPatientId = this.route.snapshot.paramMap.get('id');
    
    if (this.selectedPatientId) {
      this.retrievePatient(); // Cargar información del paciente si hay un ID seleccionado
    }

    this.loadConsents(); // Cargar listas de consentimientos informados y firmados
  }

  /**
   * Método de ciclo de vida de Angular que se ejecuta después de que la vista del componente ha sido inicializada.
   * Se usa para modificar propiedades del DOM después de la carga.
   */
  ngAfterViewInit(): void {
    // Cambiar el color de fondo del documento
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#ffffff';
  }

  /**
   * Método que carga las listas de consentimientos informados y firmados.
   * Muestra un spinner mientras se realizan las solicitudes.
   */
  private loadConsents(): void {
    this.spinner = true;
    this.loadInformedConsents();
    this.loadSignedConsents();
  }

  /**
   * Carga la lista de consentimientos informados desde el servicio y la asigna al componente.
   */
  private loadInformedConsents(): void {
    this.informedConsentService.listInformedConsents().subscribe({
      next: data => {
        this.informedConsentList = data.data; // Asignar lista de consentimientos informados
        this.spinner = false;
      },
      error: err => this.handleError(err) // Manejo de errores
    });
  }

  /**
   * Carga la lista de consentimientos firmados desde el servicio y la asigna al componente.
   */
  private loadSignedConsents(): void {
    this.signedConsentService.listSignedConsents().subscribe({
      next: data => {
        // Mapear los consentimientos firmados y construir la fuente de datos
        this.signedConsentList = data.data.map((consent: SignedConsent) => this.mapSignedConsent(consent));
        this.dataSource = [...this.signedConsentList]; // Asignar a la fuente de datos de la tabla
        this.spinner = false;
      },
      error: err => this.handleError(err) // Manejo de errores
    });
  }

  /**
   * Recupera la información del paciente seleccionado a partir de su ID.
   */
  private retrievePatient(): void {
    this.spinner = true;
    this.pacientesService.buscarPaciente(this.selectedPatientId!).subscribe({
      next: data => {
        this.currentPatient = data.patient; // Asignar datos del paciente actual
        this.spinner = false;
      },
      error: err => this.handleError(err) // Manejo de errores
    });
  }

  /**
   * Mapea un objeto `SignedConsent` añadiendo el nombre del consentimiento informado relacionado.
   * @param consent Consentimiento firmado a mapear.
   * @returns Consentimiento firmado con el nombre del consentimiento informado agregado.
   */
  private mapSignedConsent(consent: SignedConsent): SignedConsent {
    const consentName = this.findConsentName(consent.consent_id);
    return { ...consent, consent_name: consentName };
  }

  /**
   * Encuentra el nombre del consentimiento informado relacionado con un `consent_id`.
   * @param consentId ID del consentimiento informado.
   * @returns Nombre del consentimiento informado.
   */
  private findConsentName(consentId: number): string {
    return this.informedConsentList.find(consent => consent.id === consentId)?.name || '';
  }

  /**
   * Abre un diálogo para crear un nuevo consentimiento informado.
   * Si el diálogo se cierra con un resultado, se inicia la descarga del PDF.
   */
  launchPrintConsentDialog(): void {
    const dialogRef = this.dialog.open(PrintConsentDialogComponent, {
      width: '40vw',
      height: '280px',
      data: this.informedConsentList,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.downloadPdf(result.filename);
      }
    });
  }

  /**
   * Abre un diálogo para subir un consentimiento firmado.
   * Después de cerrarse, si se confirma, el resultado se maneja.
   */
  launchAddSignedConsentDialog(): void {
    const dialogRef = this.dialog.open(NewSignedConsentDialogComponent, {
      width: '40vw',
      height: '480px',
      data: {
        informedConsentList: this.informedConsentList,
        patient: this.currentPatient
      },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newSignedConsentPayload = { ...result, doctor_id: this.currentUser.id };
        this.createSignedConsent(newSignedConsentPayload)
      }
    });
  }

  createSignedConsent(payload: any){
    this.signedConsentService.createSignedConsents(payload).subscribe({
      next: data => {
        this.openSnackbar(`Se ha guardado la información correctamente`, 'Ok')
        this.loadConsents()
      },
      error: err => this.handleError(err) // Manejo de errores
    });
  }

  deleteSignedConsent(id: number){
    console.log('DELETE THIS ONE', id)
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Consentimiento Informado',
        message: '¿Seguro que quieres eliminar este consentimiento?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
         this.signedConsentService.deleteSignedConsent(id).subscribe({
          next: data => {
            this.openSnackbar(`Se ha guardado la información correctamente`, 'Ok')
            this.loadConsents()
          },
          error: err => this.handleError(err) // Manejo de errores
        });
      }
    });
   
  }


  /**
   * Simula la descarga de un consentimiento informado como PDF.
   * Este método deberá ser actualizado cuando se implemente la funcionalidad de descarga real.
   * @param filename Nombre del archivo PDF a descargar.
   */
  private downloadPdf(filename: string): void {
    const link = document.createElement('a');
    link.href = 'assets/static/informed-consents-demo/dummy_doc.pdf';
    link.download = filename;
    link.click();
  }

  /**
   * Maneja los errores de las llamadas HTTP, detiene el spinner y muestra un mensaje en consola.
   * @param error Error capturado de la respuesta HTTP.
   */
  private handleError(error: any): void {
    this.spinner = false;
    console.error('ERROR', error.error.error.message);
    // Descomentar la siguiente línea para mostrar una notificación de error
    // this.openSnackbar(`Ocurrio un error: ${error.error.error.message}`, 'Ok');
  }

  openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
