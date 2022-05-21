class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter(moreFields) {
        //Copying query object
        const queryObj = { ...this.queryString };
        if ("wordInName" in queryObj) {
            //Making sure that only alphabets are present in regex
            queryObj.name = {
                $regex: `${queryObj.wordInName.replace(/[^a-zA-Z ]/g, "")}`,
                $options: "i"
            };
            queryObj.wordInName = undefined;
        }

        //Removing given fields from queryObj
        const excludeFields = ["page", "sort", "limit", "fields"].concat(
            moreFields
        );
        excludeFields.forEach(el => delete queryObj[el]);

        //Adding $ before gte,gt,lte and lt if exists
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            match => `$${match}`
        );

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        }
        return this;
    }

    paginate() {
        //page number which is to be opened
        const page = this.queryString.page * 1 || 1;
        //number of doc in each page
        const limit = this.queryString.limit * 1 || 100;

        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
