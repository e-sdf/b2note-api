import * as n3 from "n3";
import { Store, NamedNode } from "n3";
import { exec } from "child_process";
import type { Ontology, OntologyTerm } from "./core/ontologyRegister";
import { OntologyFormat, mkOntologyTerm } from "./core/ontologyRegister";

export type { Ontology } from "./core/ontologyRegister";
export { OntologyFormat } from "./core/ontologyRegister";

function convertToTtlPm(ontUrl:  string, format: OntologyFormat): Promise<string> {
  const cmd = `docker run stain/jena riot --syntax=${format} --output=Turtle ${ontUrl}`;
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      }
      if (stderr) {
        reject(stderr);
      }
      resolve(stdout);
    });
  });
}

function getOntologyUri(store: Store): string|null {
  const hasType = new NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  const ontology = new NamedNode("http://www.w3.org/2002/07/owl#Ontology");
  const uris = store.getSubjects(hasType, ontology, null);
  return uris.length === 0 ? null : uris[0].value;
}

function mkOTerm(store: Store, node: NamedNode): OntologyTerm|null {
  const rdfsLabel = new NamedNode("http://www.w3.org/2000/01/rdf-schema#label");
  const labels = store.getObjects(node, rdfsLabel, null);
  return (
    labels.length === 0 ?
      null
    : mkOntologyTerm(node.value, labels[0].value)
  );
}

function getSubClasses(store: Store, node: NamedNode): Array<NamedNode> {
  const subClassOf = new NamedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf");
  const subClasses = store.getSubjects(subClassOf, node, null).filter(n3.Util.isNamedNode) as Array<NamedNode>;
  return subClasses.reduce(
    (res: Array<NamedNode>, sc) => [...res, ...getSubClasses(store, sc)],
    subClasses
  );
}

function getOTermsFromOntology(store: Store): Array<OntologyTerm> {
  const owlThing = new NamedNode("http://www.w3.org/2002/07/owl#Thing");
  const allOTermNodes = getSubClasses(store, owlThing);
  const oTerms = allOTermNodes.map(n => mkOTerm(store, n)).filter(t => t !== null) as Array<OntologyTerm>;
  return oTerms;
}

export function mkOntologyPm(ontUrl: string, format: OntologyFormat): Promise<Ontology> {
  return new Promise((resolve, reject) => {
    convertToTtlPm(ontUrl, format).then(
      ttl => {
      const parser = new n3.Parser();
      const quads = parser.parse(ttl);
      const store = new Store(quads);
      const ontUri = getOntologyUri(store);
      const oTerms = getOTermsFromOntology(store);
      resolve({ uri: ontUri || "<URI not detected>", terms: oTerms });
      },
      err => reject(err)
    );
  });
}
