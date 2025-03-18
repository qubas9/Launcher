class Vector {
    constructor(x,y){        
        if (typeof x != "number" || typeof y != "number") {throw new Error("X and Y of vector must be Number")}
        this.x = x
        this.y = y
    }

    get mag(){
        return Math.sqrt((this.x*this.x)+(this.y*this.y)) //calculate magnitude by pythagorien theorem
    }

    add(vector){
        this.x+=vector.x
        this.y+=vector.y
        return this
    }

    sub(vector){
        this.x-=vector.x
        this.y-=vector.y
        return this    
    }

    mult(scalar){
        if (typeof scalar != "number") {throw new Error("Scalar must be Number")}
        this.x *= scalar
        this.y *= scalar
        return this
    }
    
    div(scalar){
        if (typeof scalar != "number") {throw new Error("Scalar must be Number")}
        if (scalar == 0){throw new Error("You cant divide by 0")}
        this.x /= scalar
        this.y /= scalar
        return this
    }

    copy(){
        return new Vector(this.x,this.y)
    }
    
    normalize(){
        let mag = this.mag   
        if (mag == 0){throw new Error("You cant normalize 0 length vector")}
        this.div(mag)
        return this
    }

    setMag(newMag){
        if (typeof newMag != "number") {throw new Error("Scalar must be Number")}
        this.normalize().mult(newMag)
        return this   
    }

    static add(vecA,vecB){
        return new Vector(vecA.x+vecB.x, vecA.y+vecB.y)
    }

    static sub(vecA,vecB){
        return new Vector(vecA.x-vecB.x, vecA.y-vecB.y)
    }

    static mult(vecA,scalar){
        if (typeof scalar != "number") {throw new Error("Scalar must be Number")}
        return new Vector(vecA.x*scalar, vecA.y*scalar)
    }

    static div(vecA,scalar){
        if (typeof scalar != "number") {throw new Error("Scalar must be Number")}
        if (scalar == 0){throw new Error("You cant divide by 0")}
        return new Vector(vecA.x/scalar, vecA.y/scalar)
    }

    static dot(vecA,vecB){
        return vecA.x * vecB.x + vecA.y * vecB.y
    }    
}
export default Vector