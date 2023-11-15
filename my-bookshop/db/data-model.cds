namespace my.bookshop;
using { Country, managed } from '@sap/cds/common';

entity Books {
  key ID : String;
  title  : localized String;
  author : Association to Authors;
  stock  : String;
}

entity Authors {
  key ID : String;
  name   : String;
  books  : Association to many Books on books.author = $self;
}

entity Orders : managed {
  key ID  : UUID;
  book    : Association to Books;
  country : Country;
  amount  : Integer;
}
