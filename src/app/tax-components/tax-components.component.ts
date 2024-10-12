import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tax-components',
  templateUrl: './tax-components.component.html',
  styleUrl: './tax-components.component.scss'
})
export class TaxComponentsComponent {

  declarationTab = true;
  previousIncomeTab = false;
  form12BBTab = false;
  taxFilingTab = false;
  taxSavingInvestmentTab = false;


  myDeclarTab = true;
  LakhExemptionTab = false;
  otherExempTab = false;
  taxSavingExemptionTab = false;
  housePropTab = false;

  constructor(public activeModal: NgbActiveModal,
  ) {

  }
  cities = ['Mumbai', 'Delhi', 'Hyderabad', 'chennai', 'Other Non Metro', 'Other Metro']
  rentedFrom = [];

  tab1() { this.declarationTab = true; this.previousIncomeTab = false; this.form12BBTab = false; this.taxFilingTab = false; this.taxSavingInvestmentTab = false }
  tab2() { this.declarationTab = false; this.previousIncomeTab = true; this.form12BBTab = false; this.taxFilingTab = false; this.taxSavingInvestmentTab = false }
  tab3() { this.declarationTab = false; this.previousIncomeTab = false; this.form12BBTab = true; this.taxFilingTab = false; this.taxSavingInvestmentTab = false }
  tab4() { this.declarationTab = false; this.previousIncomeTab = false; this.form12BBTab = false; this.taxFilingTab = true; this.taxSavingInvestmentTab = false }
  tab5() { this.declarationTab = false; this.previousIncomeTab = false; this.form12BBTab = false; this.taxFilingTab = false; this.taxSavingInvestmentTab = true }

  myDecalrationFun() {
    console.log('lll');

  }
  closeModel(dismiss) {
    this.activeModal.dismiss(dismiss);
  }
}
