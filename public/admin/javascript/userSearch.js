// function searchFun(){
//     let filter = document.getElementById('search-term').value.toUpperCase();
//     let userTable = document.getElementById('userTable');
//     let tr = userTable.getElementsByTagName('tr');
//     for(let i=0;i<tr.length;i++){
//       let td= tr[i].getElementsByTagName('td')[0];
//       if(td){
//         let textvalue = td.textContent || td.innerHTML;
//         if(textvalue.toUpperCase().indexOf(filter)>-1){
//           tr[i].style.display='';
//         }
//         else{
//           tr[i].style.display='none'
//         }
//       }
//     }
//   }

// user search
  // function searchFun(){
  //   let filter = document.getElementById('search-term').value.toUpperCase();
  //   let userTable = document.getElementById('Table');
  //   let tr = userTable.getElementsByTagName('tr');
  //   for(let i=0;i<tr.length;i++){
  //     let td = tr[i].getElementsByTagName('td');
  //     let match = false;
  //     for(let j=0;j<td.length;j++){
  //       let textvalue = td[j].textContent || td[j].innerHTML;
  //       if(textvalue.toUpperCase().indexOf(filter)>-1){
  //         match = true;
  //         break;
  //       }
  //     }
  //     if(match){
  //       tr[i].style.display='';
  //     }
  //     else{
  //       tr[i].style.display='none'
  //     }
  //   }
  // }


  $(document).ready(function () { $("#Table").DataTable(); } );

