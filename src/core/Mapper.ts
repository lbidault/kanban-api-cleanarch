export interface Mapper<A, B> {
  toDomain?(raw: A): B;
  fromDomain?(data: B): A;
}
