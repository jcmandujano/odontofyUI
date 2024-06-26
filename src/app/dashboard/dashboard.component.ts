import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from '../services/utils/session-storage.service'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";   
import { User } from '../services/user/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  numbers: number[];
  currentUser: User = new User;

  constructor(private sessionService : SessionStorageService,
  private router: Router, private elementRef: ElementRef,
  private matIconRegistry: MatIconRegistry,
  private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      "agenda",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/dashboard_agenda.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "finanzas",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/dashboard_finanzas.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "pacientes",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/dashboard_user.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "concentimientos",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/vepet_concentimientos.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "ficha_id",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/vepet_ficha_identificacion.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "odontograma",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/vepet_odontograma.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "settings",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/settings_dashboard.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "logout",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/logout_dashboard.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "recetas",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/dashboard_recetas.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "agendaDot",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/dashboard_agenda.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "iniciaCita",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/dashboard_init_cita.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "editaCita",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/dashboard_edit_cita.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "eliminaCita",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/dashboard_delete_cita.svg")
    );

    //usado para iterar n veces la lista de citas en la agenda
    this.numbers = Array(8).fill(0).map((x,i)=>i); // [0,1,2,3,4]
   }
  faEnvelope = faEnvelope;
  ngOnInit(): void {
    this.currentUser = this.sessionService.getUser();
  }

  ngAfterViewInit(){
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#f6f9fd';
  }

  doLogout(){
    this.sessionService.signOut();
    this.router.navigate([''])
  }

  crearPaciente(){
    this.router.navigate(['crea-pacientes'])
  }

  listadePacientes(){
    this.router.navigate(['lista-pacientes'])
  }


}
