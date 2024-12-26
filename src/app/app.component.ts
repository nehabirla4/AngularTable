import {
  Component,

  OnInit,
  ViewChild,
  ElementRef,

} from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { DataService } from './data.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import * as XLSX from 'xlsx';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Xliff } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  deleteList: any[] = [];
  editId: any;
  title = 'nehaa';
  form: any;
  editIndex: number | null = null;
  dataList: any[] = [];
  i: any;
  selectedOption: any;
  suboption: any;
  selectAllChecked: boolean = false;
  screenSize: number;
  s:any="";
  resultString: String = '';
  formValue: any;
  filterDate: string | null = null;
  uniqueMail: boolean = true;
  isEditing = false;
  page = 1;
  pageSize = 5;
  paginatedData: any[] = [];
  totalPages = 0;
// selectedGenders:any[]=[];
imageFile2: any;
isFilter:boolean=false;
filterArr:any[]=[];
  genderop:any[]=[];

  genders = [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },
    { id: 3, name: 'Other' },
  ];

  options = [
    { op: 'name' },
    { op: 'age' },
    { op: 'date' },
    { op: 'gender'},
  ];

  counts = {
    male: { total: 0, kids: 0, adult: 0, old: 0 },
    female: { total: 0, kids: 0, adult: 0, old: 0 },
    other: { total: 0, kids: 0, adult: 0, old: 0 },
  };

  // toppings = new FormControl('');
  selectedGenders: string[] = ['Male','Female','Other'];

  constructor(
    public fb: FormBuilder,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private dataService: DataService
  ) {
    this.form = this.fb.group({
      id:[''],
      name: [''],
      email: [''],
      discription: [''],
      date: [''],
      disabled: [''],
      gender: [''],
      dobcontrol: [''],
      dob: [''],
      imageFile: [null],
      // imagef:this.imageFile,
      textFile: [''],
    });
    this.screenSize = window.innerWidth;
  }

  findcount() {
    console.log('the Findout');
    this.counts = this.dataList.reduce(
      (accumulator, item) => {
        const gender = item.gender;
        const dob = item.dob;
        if (gender === 'Male' || gender === 'Female' || gender === 'Other') {
          const category = dob <= 14 ? 'kids' : dob <= 60 ? 'adult' : 'old';
          
          if (gender === 'Male') {
            accumulator.male.total++;
            accumulator.male[category]++;
          } else if (gender === 'Female') {
            accumulator.female.total++;
            accumulator.female[category]++;
          } else {
            accumulator.other.total++;
            accumulator.other[category]++;
          }
        }
        return accumulator;
      },
      {
        male: { total: 0, kids: 0, adult: 0, old: 0 },
        female: { total: 0, kids: 0, adult: 0, old: 0 },
        other: { total: 0, kids: 0, adult: 0, old: 0 },
      }
    );
  }

  @ViewChild('table') table!: ElementRef;

  ngOnInit(): void {
    this.getLocalStorage();
    this.findcount();
    this.updatePaginatedData();
    if(this.isFilter){
      this.totalPages=Math.ceil(this.filterArr.length/this.pageSize);
    }
    else{
    this.totalPages = Math.ceil(this.dataList.length / this.pageSize);
    }
    console.log(this.deleteList);
  }

  getLocalStorage(): void {
    const storedData = localStorage.getItem('dataList');
    if (storedData) {
      this.dataList = JSON.parse(storedData);
       this.updatePaginatedData();
    }
  }
  
  storeLocalStorage(): void {
      localStorage.setItem('dataList', JSON.stringify(this.dataList));
    }

  updatePaginatedData() {
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    if(this.isFilter){
      console.log("inside if")
      this.paginatedData=this.filterArr.slice(startIndex,endIndex);
      this.page=1;
      this.totalPages=Math.ceil(this.filterArr.length/this.pageSize);
       this.getPageNumbers();
    }
    else{
    this.paginatedData = this.dataList.slice(startIndex, endIndex);
    }
    // this.getLocalStorage();
    // return this.dataList.slice(startIndex,endIndex);
    console.log("Filter",this.isFilter);
    console.log("the paginated",this.paginatedData);
  }
  
  setPage(page: number) {
    this.page = page;
    this.updatePaginatedData() ;
}
 
  getPageNumbers() {
    return new Array(this.totalPages);
  }

  uniquemail(event: any) {
    this.uniqueMail = true;
    let mail = this.form.get('email').value.toLowerCase();
    this.dataList.forEach((item) => {
      if (item.email == mail) {
        console.log('email Aready exists');
        this.uniqueMail = false;
      }
    });
  }

  formatDate(date: string): string {
    console.log('Format date');
    let m = moment(date).format(' YYYY-MMM-DD');
    console.log('Date moment:', moment(date).format(' YYYY-MMM-DD'));
    this.form.get('date').setValue(m);
    return m;
  }

  getcurrentdate(): Date {
    return new Date();
  }
  // image File
  onFileChange(event: any) { 
    console.log('inside File');
    const file = event.target.files[0];
    // this.imageFile2=file;
    console.log(this.imageFile2);
    console.log(event.target.files[0].name);
    const reader = new FileReader();
    reader.onloadend = () => {
      let base_64String = reader.result as string;
      // console.log(base_64String);
      this.s=base_64String;
      // image/png;base64
      // this.base64String = reader.result as string;
      this.form.get('imageFile').setValue(base_64String);
      console.log(this.form.get('imageFile').value);
      let s=this.form.get('imageFile').value
      // this.imageFile=this.base64String;
    };
    if (file) {
      reader.readAsDataURL(file);
    }
   let Files=this.s.replace('data:image/png;base64,','');
   const ByteArray=new Uint8Array(
    atob(Files).split('').map((char)=>char.charCodeAt(0))
   );
   const file2=new Blob([ByteArray],{type:'image/png'});
   const fileUrl=URL.createObjectURL(file2);
   console.log(fileUrl);
   let fileName='download pdf';
    // this.downloadFile();
   
    // console.log("hello");
    // const imageName = file;
    // const imageBlob = this.dataURItoBlob(s);
    // console.log(imageBlob);
    // const imageFile = new File([imageBlob], imageName, { type: 'image/png' });
    // console.log(imageFile);
    // this.imageFile2=imageFile;
    // console.log();
  }

//   dataURItoBlob(dataURI: string) {
//     const byteString = window.atob(dataURI);
//     console.log(byteString);
//     const arrayBuffer = new ArrayBuffer(byteString.length);
//     const int8Array = new Uint8Array(arrayBuffer);
//     for (let i = 0; i < byteString.length; i++) {
//       int8Array[i] = byteString.charCodeAt(i);
//     }
//     const blob = new Blob([int8Array], { type: 'image/png' }); 
//     console.log("Blob",blob); 
//     return blob;
//  }
downloadFile(){
   this.s=this.form.get('imageFile').value;
   console.log(this.s);
   let Files=this.s.replace('data:image/png;base64,','');
   const ByteArray=new Uint8Array(
    atob(Files).split('').map((char)=>char.charCodeAt(0))
   );
   const file=new Blob([ByteArray],{type:'image/png'});
   const fileUrl=URL.createObjectURL(file);
   console.log(fileUrl);
   let fileName='download pdf';
}

  // Text File
  onTextFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const text = e.target.result;
        try {
          const json = text;
          console.log('Json content', json);
        } catch (error) {
          console.log('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  }

  calculateAge(data: any): string {
    let today = new Date().getFullYear();
    let dobyear;
    let age;
    if (typeof data == 'number') {
      dobyear = today - data;
      age = data;
    }
    if (typeof data == 'string') {
      dobyear = new Date(data).getFullYear();
      age = today - dobyear;
    }
    return `born in ${dobyear} (${age})`;
  }

  uidfun() {
    let guid = Guid.create();
    let ans = String(guid);
    this.form.get('id').setValue(ans);
    console.log(ans);
    // return ans;
  }
  filepath: any;

  submit() {
    console.log("submit id",this.form.get('id'));
    console.log('inside Submit');
    this.uidfun();
    console.log(this.form.value);
    this.formValue = {
      ...this.form.value,
    };
    if (this.editIndex !== null) {
      // debugger
      console.log("insode edit");
      console.log(this.editId);
       const formValue = { ...this.form.value, id: this.editId };
      // const formValue = { ...this.form.value};
      this.dataList[this.editIndex] = formValue;
      this.isEditing = false;
    } else {
      this.dataList.push({ ...this.formValue });
    }
    console.log('the datalist:', this.dataList);
    this.storeLocalStorage();
    // this.dataService.postData(this.formValue).subscribe(
    //   (response) => {
    //     console.log('Data posted successfully:', response);
    //   },
    //   (error) => {
    //     console.error('Error posting data:', error);
    //   }
    // );
    this.imageFile2="";
    this.form.reset();
    this.editIndex = null;
    this.selectAllChecked = false;
    this.updatePaginatedData();
    this.totalPages = Math.ceil(this.dataList.length / this.pageSize);
    console.log('inside Submit');
    console.log(this.dataList);
    this.findcount();
    
  }

  Reset(event: Event) {
    event.preventDefault();
    this.form.reset();
    //window.location.reload();
  }

  edit(id: any):boolean {
    // this.form.patchValue(this.dataList.find((x)=>x.id==id))
    // console.log(this.form);
    this.editIndex = this.dataList.findIndex(x=>x.id===id);
    this.form.patchValue(this.dataList[this.editIndex]);
    console.log("Edit id",this.form.get('id').value);
    console.log(this.form.get('imageFile').value);
    //  this.isEditing = true;
    this.editId=id; 
    return true;
}

  getcategory(data: any): string {
    let today = new Date();
    let dobyear;
    let age;
    if (typeof data == 'number') {
      age = data;
    }
    if (typeof data == 'string') {
      dobyear = new Date(data).getFullYear();
      age = today.getFullYear() - dobyear;
    }
    if (!age) {
      return 'Un-available';
    } else {
      let s = age <= 14 ? 'kid' : age >= 15 && age <= 60 ? 'adult' : 'old';
      return s;
    }
  }

  // storeLocalStorage(): void {
  //   localStorage.setItem('dataList', JSON.stringify(this.dataList));
  // }

  // selectAll(event: Event) {
  //   console.log('Select all value:', this.selectAllChecked);
  //   console.log('inside SelectAll', event);
  //   const target = event.target as HTMLInputElement;
  //   if (target.checked) {
  //     this.selectAllChecked = target.checked;
  //     // USE []
  //     this.deleteList.length = 0;
      
  //     this.dataList.forEach((data) => {
  //       data.selected = true;
  //       this.deleteList.push(data);
  //     });
  //     console.log('deleteList:', this.deleteList);
  //   } else {
  //     this.deleteList.length = 0;
  //     console.log('deleteList:', this.deleteList);
  //     // this.dataList.forEach(data => {
  //     //   data.selected =false;
  //     // });
  //     this.dataList.map((data) => (data.selected = false));
  //   }
  //   if (
  //     this.dataList.length == this.deleteList.length &&
  //     this.dataList.length > 0
  //   ) {
  //     console.log('inside if');
  //     this.selectAllChecked = true;
  //     console.log(this.selectAllChecked);
  //   } else {
  //     console.log('inside else');
  //     this.selectAllChecked = false;
  //     console.log(this.selectAllChecked);
  //   }
  //   this.selectAllChecked = false;
  // }

 
  // if(this.dataList.length==this.deleteList.length){
  // this.selectAll(event);
  // }
  // const allSelected = this.dataList.every(item => item.selected);
  // this.selectAllChecked = allSelected;

  // this.ConvertExcel(this.deleteList);
  // if(this.deleteList.length==this.dataList.length)
  // this.selectAllChecked=true;

  // readFile() {
  //   const file = this.form.get('imageFile').value;
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     console.log("the result is",reader.result);
  //   };
  //   reader.readAsText(file);
  // }
  selectF():boolean{
    // console.log("Hello checked");
    if(this.isFilter){
      this.selectAllChecked=this.filterArr.length >0 &&this.filterArr.length===this.deleteList.length;
    }
    else{
    this.selectAllChecked = this.dataList.length > 0 && this.dataList.length === this.deleteList.length;
    }
    console.log(this.dataList);
    console.log(this.deleteList);
    console.log(this.selectAllChecked);
    if(this.selectAllChecked)
    return true;
  return false;
  }

  singleChecked(id:any):boolean{
    let ans;
     ans=this.deleteList.filter(x=>x.id==id).length>0;
     return ans;
  }

  selectFun(event:Event){
    console.log("paginated",this.paginatedData);
    const target = event.target as HTMLInputElement;
    if (target.checked) { 
      if(this.isFilter){
        this.deleteList=[...this.filterArr];
      } 
      else{
      this.deleteList=[...this.dataList];}
    }
    else{
      console.log("unchecked");
      this.deleteList=[];
    } 
  }

  select(id: any, event: Event) {
    // id if present
    // debugger
    // console.log('inside Select');
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      if(this.isFilter){
        this.deleteList=[...this.deleteList,...this.filterArr.filter((x)=>x.id===id),];
      }
      else{
      this.deleteList = [
        ...this.deleteList,
        ...this.dataList.filter((x) => x.id === id),
      ];
    }
    console.log("the dataList",this.deleteList);
      // this.deleteList = [...this.dataList.filter(x => x.id === id)];
      // console.log('deleteList:', this.deleteList);
    } else {
       this.deleteList = this.deleteList.filter((x) => x.id !== id);
       console.log("the deleteList",this.deleteList);
      // console.log('deleteList:', this.deleteList);
    }
    //this.isAllSelected;
  }

  openDialog(data: any) {
    // this.dialog.open(DialogComponent);
    this.resultString = this.generateResultString(data);
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '550px',
      data: { myString: this.resultString },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }  

  delete(id: any) {
     debugger
    console.log("Paginated ata",this.paginatedData);
    // console.log(page);
    if(this.isFilter){
      let index2=this.filterArr.findIndex(x=>x.id==id)
      if(index2>=0){
       this.filterArr.splice(index2,1);
      }}
    
    if(this.deleteList.length){
      console.log(this.deleteList)
    let index2=this.deleteList.findIndex(x=>x.id==id)
    if(index2>=0){
     this.deleteList.splice(index2,1);
    }}
    let index = this.dataList.findIndex((x) => x.id == id);  
    console.log('data Deleted:', this.dataList[index]);
    this.dataList.splice(index, 1);
    this.storeLocalStorage();
    
    // this.dataService.deleteData(id).subscribe(
    //   (response) => {
    //     console.log('Item deletd successfully:', response);
    //   },
    //   (error) => {
    //     console.error('Error deleting item:', error);
    //   }
    // );
    // this.selectAllChecked = false;
    // this.updatePaginatedData();
    console.log('this select all ', this.selectAllChecked);
    console.log("Paginated ata",this.paginatedData);
    console.log("data",this.dataList);
    console.log("deleteList",this.deleteList);
    if(this.isFilter){
      this.totalPages = Math.ceil(this.filterArr.length / this.pageSize);
    const startIndex = (this.page - 1) * this.pageSize;
    if (startIndex >= this.filterArr.length && this.page > 1) {
      this.page--;
    }  }
    else{
    this.totalPages = Math.ceil(this.dataList.length / this.pageSize);
    const startIndex = (this.page - 1) * this.pageSize;
    console.log("startIndex",startIndex);
    if (startIndex >= this.dataList.length && this.page > 1) {
      this.page--;
    }}
    this.updatePaginatedData();
    this.findcount();
  }

  DeleteFun(page:number) {
    if (confirm('do you want to delete the Selected Data') == true) {
      // this.deleteList.map((x) => (x.selected = false));
      // let id;
      // for (let i = 0; i < this.deleteList.length; i++) {
      //   id = this.deleteList[i].id;
      //   console.log(this.deleteList[i].id);
      //   this.delete(id);
      // }
      // if(this.deleteList.length==this.dataList.length){
      //     this.dataList=[];
      //     this.deleteList=[];
      //       this.storeLocalStorage();
      // }
     
     while(this.deleteList.length){
      this.delete(this.deleteList[0].id);
     }
      this.deleteList = [];
      // this.selectAllChecked = false;
    } else {
      this.deleteList.map((x) => (x.selected = false));
      this.deleteList = [];
    }
    // this.updatePaginatedData();
    // this.totalPages = Math.ceil(this.dataList.length / this.pageSize);
    // this.getPageNumbers();

    // this.setPage();
  }

  handleImageError(event: any) {
    // const fileValues = { img: this.base64String };
    // console.log(fileValues);
    console.error('Error loading image:', event.error);
  }

  handleImageLoad(event: any) {
    console.log('Image loaded successfully:', event);
  }

  generateResultString(data: any): String { 
    console.log(data);
    this.resultString = '';
    // let keys=Object.keys(data);
    const orderedKeys = ['name', 'dob', 'gender', 'discription'];
    orderedKeys.forEach((key) => {
      console.log(key);
      let value = data[key];
      if (value) {
        if (key == 'dob') {
          this.resultString += this.calculateAge(data.dob) + ' | ';
          this.resultString += this.getcategory(data.dob) + ' | ';
        } else {
          this.resultString += `${value} | `;
          console.log('the result string', this.resultString);
        }
      }
    });
    if (this.resultString.endsWith(' | ')) {
      this.resultString = this.resultString.slice(0, -3);
    }
    return this.resultString;
  }


  DateFliter() {
    console.log('hello');
    if (this.filterDate) {
      const selectedDate = new Date(this.filterDate);
      this.filterArr = this.dataList.filter(
        (item) => new Date(item.date) <= selectedDate
      );
      console.log('the filter Date', this.filterArr);
      // console.log("the tempDataList",this.tempDataList);
    }
    this.updatePaginatedData();
  }

  tableSort() {
    this.getLocalStorage();
    console.log(this.dataList);
    console.log(this.selectedOption);
    // console.log(event);
    // const selectedOption=event.target.value;
    if (this.selectedOption == 'name') {
      this.dataList.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.selectedOption == 'age') {
      this.dataList.sort((a, b) => a.dob - b.dob);
    } else if (this.selectedOption == 'date') {
      this.isFilter=true;
      // this.dataList.sort((a,b)=> a.date-b.date)
      this.DateFliter();
    } else {
      this.isFilter=true;
      console.log('inside Gender');
      console.log(this.dataList);
      console.log(this.selectedOption);
      console.log(this.genders);
      console.log(this.genderop);
      // this.dataList = this.dataList.filter(
      //   (item) => item.gender === this.genderop[0]||this.genderop[1]
      // );
      this.filterArr=this.dataList.filter(
        (item)=>this.genderop.includes(item.gender)
      )
      console.log('Genderss', this.filterArr);
      // this.dataList = this.dataList.filter(item => item.gender === this.selectedGender);
      console.log(this.isFilter) ;  
    }
    console.log('the date is:', this.filterDate);
    // console.log("the tempDataList",this.tempDataList);
    this.page=1;
    this.totalPages = Math.ceil(this.dataList.length / this.pageSize);
    this.updatePaginatedData();
  }

  resetFilter() {
    debugger
    this.isFilter=false;
    console.log('inside click');
    this.getLocalStorage();
    console.log(this.dataList);
    this.selectedOption = '';
    this.genderop = [];
    // this.toppings.reset();
    this.filterDate="";
      this.page=1;
     this.updatePaginatedData();
     this.totalPages = Math.ceil(this.dataList.length / this.pageSize);
    this.getPageNumbers();
  }

  // ConvertExcel(){
  //   let date=new Date();
  //   const workbook= xls.utils.table_to_book(this.table.nativeElement);
  //   xls.writeFile(workbook,`employeeList_${date}.xlsx`);
  //  }
  ConvertExcel(selectedData: any[]) {
    if (selectedData.length == 0) {
      selectedData = [...this.dataList];
      console.log('if', selectedData);
    }
    console.log(selectedData);
    const workbook = XLSX.utils.table_to_book(this.table.nativeElement);
    console.log('inside else');
    // Get the first worksheet
    const headerRow: string[] = [
      'Name',
      'Email',
      'Discription',
      'Date',
      'Disability',
      'DOB',
      'Gender',
      'Age Group',
    ];
    const headerWorksheet = {
      '!ref': 'A1:I1',
      ...XLSX.utils.aoa_to_sheet([headerRow]),
    };
    workbook.Sheets[workbook.SheetNames[0]] = headerWorksheet;
    console.log('the data', selectedData);
    const filteredRows: unknown[][] = [];
    selectedData.forEach((data) => {
      const row: string[] = [];
      row.push(data.name);
      row.push(data.email);
      row.push(data.discription);
      row.push(data.date ? moment(data.date).format('YYYY-MMM-DD') : '');
      row.push(data.disabled ? 'Yes' : 'No');
      row.push(data.dob ?  this.calculateAge(data.dob) : '');
      row.push(data.gender);
      row.push(this.getcategory(data.dob));
      filteredRows.push(row);
      console.log(row);
    });
    // Add the filtered data to the worksheet
    const filteredWorksheet = {
      '!ref': `A2:I${filteredRows.length + 1}`,
      ...XLSX.utils.aoa_to_sheet([headerRow, ...filteredRows]),
    };
    workbook.Sheets[workbook.SheetNames[0]] = filteredWorksheet;
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `EmployeeList_${new Date()}.xlsx`);
    this.deleteList.map((x) => (x.selected = false));
  }

  // showTextFile(event: any){
  //  console.log("inside text");
  //  const filess=event?.target.files[0];
  //  console.log(event?.target.files[0]);
  //  const reader = new FileReader();
  //  reader.onload = () => {
  //   this.fileText = reader.result as string;
  // };

  // console.log(reader.readAsText(filess));

  //  const reader2=new FileReader();
  //  reader2.onload=()=>{
  //   this.base64String=reader2.result as string;
  //  };
  //  if(filess){
  //   reader2.readAsDataURL(filess);
  //  }
  // }

  // findcount(){
  //   debugger
  //   console.log("datalist",this.dataList);
  //   for(let i=0;i<this.dataList.length;i++){
  //     let gender=this.dataList[i].gender
  //     if(gender=='Male'){
  //       this.counts.male.total++;
  //       if (this.dataList[i].dob <= 14) {
  //         this.counts.male.kids++;
  //       } else if (this.dataList[i].dob <= 60) {
  //         this.counts.male.adult++;
  //       } else {
  //         this.counts.male.old++;
  //       }
  //       }else if(gender=='Female'){
  //         this.counts.female.total++;
  //           if(this.dataList[i].dob <= 14){
  //             this.counts.female.kids++;
  //           }else if(this.dataList[i].dob <= 60){
  //             this.counts.female.adult++;
  //           }else{
  //             this.counts.female.old++;
  //           }
  //       }else {
  //         this.counts.other.total++;
  //           if(this.dataList[i].dob <= 14){
  //             this.counts.other.kids++;
  //           }else if(this.dataList[i].dob <= 60){
  //             this.counts.other.adult++;
  //           }else{
  //             this.counts.other.old++;
  //           }
  //     }
  //   }
  // }

  // generateResultString(): void {
  //   console.log("inside function");
  //  this.formValues = this.form.value;
  //   console.log(this.formValues);
  //   const keys = Object.keys(this.formValues);
  //   let resultArr: string[] = [];
  //   keys.forEach(key => {
  // console.log("inside for");
  // const control = this.form.get(key);
  // console.log("control:", control);
  //   if (control && (control.dirty || control.touched)) {
  //     const value = this.formValues[key];
  //     if (value) {
  //       //
  //       switch (key){
  //         case 'name':
  //         resultArr.push(`${value}`);
  //         break;
  //         case 'dob':
  //           const age = this.calculateAge(value);
  //           const ageGrup=this.getcategory(value);
  //           resultArr.push(`(${age} Y ) | ${ageGrup}`);
  //           break;
  //         case 'gender':
  //            resultArr.push(`${value}`)
  //            break;
  //          case 'discription':
  //             resultArr.push(`${value}`)
  //             break;
  //       }
  //     }
  //   }
  // });

  // this.resultString = resultArr.join('|');
  // console.log("string:", this.resultString);
  // }
  //  select(id:any,event:Event){
  //   console.log("inside Select");
  //   const target = event.target as HTMLInputElement;
  //   if (target.checked) {
  //    const index=this.dataList.findIndex(x=>x.id===id);
  //    console.log("id",id,"index",index);
  //    this.deleteList.push(this.dataList[index]);
  //    console.log("deleteList:",this.deleteList);

  //   }

  //   if (!target.checked) {
  //     console.log(target.checked);
  //     const deleteIndex=this.dataList.findIndex(x=>x.id===id);
  //     console.log("id",id,"index",deleteIndex);
  //       this.deleteList.splice(deleteIndex, 1);

  //       console.log("deleteList:", this.deleteList);
  //    }
  //  }

  // editData(index: number) {
  //   this.form.setValue(this.dataList[index]);
  //   // this.delete(index);
  // }

  // isDisabledChecked(event:any){
  //   const isChecked = event.target.checked;
  //  this.form.get('disabled').setValue(isChecked);
  // }
  // isChecked:boolean = false;

  // doCheck() {
  //     this.isChecked = !this.isChecked;
  // }

  //  formatDate(date: Date):string{
  //   if (!date) return '';
  //   const dateObj = new Date(date);
  //   const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`;
  //   console.log(formattedDate);
  //   this.form.get('date').setValue(formattedDate)
  //      return formattedDate;
  // }

  // setgender() {
  //   const genderControl = this.form.get('gender');
  //   const genderValue = Number(genderControl.value);
  //   let genderArr=["Male","Female","Others"]
  //   console.log("genderValue:", genderValue);
  //   if (genderValue === 1) {
  //     this.form.get('gender').setValue(genderArr[0]);
  //   } else if (genderValue === 2) {
  //     this.form.get('gender').setValue(genderArr[1]);
  //   } else if (genderValue === 3) {
  //     this.form.get('gender').setValue(genderArr[2]);
  //   }
  //   console.log("hello", genderControl.value);
  // }

  // setage():number{
  //   const d=new Date();
  //   const currYear=d.getFullYear();
  //   console.log(currYear);
  //   const dobdate = this.form.get('dobDate');
  //   const dobdates=dobdate.value;
  //   const dobDateObj = new Date(dobdates);
  //   const bYear = dobDateObj.getFullYear();
  //   console.log(bYear);
  //   let age=currYear-bYear;
  //   console.log("My age is:",age);
  //   return age;
  // }

  // setyear():number{
  //   const age=this.form.get('age');
  //   const d=new Date();
  //   const currYear=d.getFullYear();
  //   const bYear=age-currYear;
  //   console.log("My year is:",bYear);
  //   return bYear;
  // }

  // cancelEdit() {
  //   this.editIndex = null;
  //   this.form.reset();
  // }

  // saveEdit() {
  //   if (this.editIndex !== null) {
  //     this.dataList[this.editIndex] = this.form.value;
  //     this.editIndex = null;
  //     this.storeLocalStorage();
  //     this.form.reset();

  //   }
  // }
}
