type BaybayinSampleImagesProps = {
    letter: string;
};

function BaybayinSampleImages(
    { letter }: BaybayinSampleImagesProps
) {
    return (
        <div className="baybayin-sample-images-container">
            <div className="baybayin-each-image">
                <img src={`/client/public/images/${letter}_1.png`} />
            </div>
            <div className="baybayin-each-image">
                <img src={`/client/public/images/${letter}_2.png`} />
            </div>
            <div className="baybayin-each-image">
                <img src={`/client/public/images/${letter}_3.png`} />
            </div>
        </div>
    )
}

export default BaybayinSampleImages