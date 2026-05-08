const CardEnlarge = ({url, onClose}) => {


    return(
        <>
        
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <img
            src={url}
            alt="enlarged view" 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" 
            onClose={(e) => e.stopPropagation()}
            />
        </div>
        
        
        </>
    )

}


export default CardEnlarge; 