import Verify from "@/components/verify";
import { useParams } from "react-router-dom";

const VerifyPage = ()=>{
    const { id } = useParams(); // Lấy ID từ URL
    console.log("Received ID:", id); // Kiểm tra log
    return(
        <>
            <Verify
                id = {id}
            />
        </>
    )
}
export default VerifyPage;