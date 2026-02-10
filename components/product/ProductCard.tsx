import Link from "next/link";
import Image from "next/image";

type Props = {
  id: string;
  name: string;
  image: string;
};

export default function ProductCard({ id, name, image }: Props) {
  return (
    <Link href={`/products/${id}`}>
      <div>
        <Image src={image} alt={name} width={600} height={800} />
        <p>{name}</p>
      </div>
    </Link>
  );
}
